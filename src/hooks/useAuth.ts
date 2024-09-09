// src/hooks/useAuth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

interface SignUpData {
  name: string;
  phone: string;
  email: string;
  password: string;
  businessCode: string;
}

interface LoginData {
  email: string;
  password: string;
  businessCode: string;
}

export const useAuth = () => {
  const signUp = async (formData: SignUpData) => {
    const { name, phone, email, password, businessCode } = formData;

    // Search for a business with the given business code
    const businessQuery = query(
      collection(db, "businesses"),
      where("ManagerCode", "==", businessCode)
    );
    let querySnapshot = await getDocs(businessQuery);

    if (querySnapshot.empty) {
      const staffQuery = query(
        collection(db, "businesses"),
        where("StaffCode", "==", businessCode)
      );
      querySnapshot = await getDocs(staffQuery);
    }

    if (querySnapshot.empty) {
      throw new Error("Business not found");
    }

    const businessDoc = querySnapshot.docs[0];
    const businessData = businessDoc.data();

    const role =
      businessData.ManagerCode === businessCode ? "manager" : "staff";
    const businessId = businessDoc.id;

    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Set the employee document
    const userData = { name, phone, email, role, businessId };
    await setDoc(
      doc(db, "businesses", businessId, "employees", user.uid),
      userData
    );

    localStorage.setItem("userDetails", JSON.stringify(userData));

    return { role, businessId };
  };
  const login = async (formData: LoginData) => {
    const { email, password, businessCode } = formData;

    try {
      // Authenticate the user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Find the business associated with the provided code
      const businessQuery = query(
        collection(db, "businesses"),
        where("Code", "==", businessCode)
      );
      const businessSnapshot = await getDocs(businessQuery);

      if (businessSnapshot.empty) {
        throw new Error("Business not found for the provided code");
      }

      const businessDoc = businessSnapshot.docs[0];
      const businessId = businessDoc.id;

      // Fetch the user document within the nested 'employees' collection of the business
      const userDocRef = doc(
        db,
        "businesses",
        businessId,
        "employees",
        user.uid
      );
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User document does not exist");
      }

      const userData = userDoc.data();
      const userId = user.uid;

      // Store the necessary details including the business ID in local storage
      localStorage.setItem(
        "userDetails",
        JSON.stringify({ ...userData, businessId, userId })
      );

      if (userData.role !== "manager" && userData.role !== "staff") {
        throw new Error("User role is not recognized");
      }

      return { role: userData.role };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  return { signUp, login };
};

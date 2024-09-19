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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

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
      const userDetails = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        businessId: businessId,
      };

      // Store user details in localStorage
      localStorage.setItem("userDetails", JSON.stringify(userDetails));

      return { role: userData.role };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  return { signUp, login };
};

import { User } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// A function to check the user's role and return a boolean value.
export async function checkUserRole(
  user: User | null,
  expectedRole: string
): Promise<boolean> {
  if (!user) return false;

  try {
    const userDocRef = doc(db, "employees", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === expectedRole;
    }

    return false;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}

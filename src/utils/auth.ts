// src/utils/auth.ts
import { User } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function checkUserRole(
  user: User | null,
  expectedRole: string
): Promise<boolean> {
  if (!user) return false;

  try {
    const userDocRef = doc(db, "employees", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().role === expectedRole) {
      return true; // The user has the expected role
    } else {
      return false; // The user does not have the expected role
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}


import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyCO-Eo1BgF8AZDpeR3hF-S6qSt5DJcTtdg",
    authDomain: "gbpscalendar.firebaseapp.com",
    projectId: "gbpscalendar",
    storageBucket: "gbpscalendar.firebasestorage.app",
    messagingSenderId: "615502714228",
    appId: "1:615502714228:web:a6bb2c10699900cefa4821"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const calendarCollectionRef = collection(db, "Calendar");
export const addCalendarData = async (calendarData) => {
    try {
        const newData = {
            date: calendarData[0] || '',
            sumenglish: calendarData[1] || '',
            sumhindi: calendarData[2] || '',
            remarkenglish: calendarData[3] || '',
            remarkhindi: calendarData[4] || '',
        };
        const docRef = await addDoc(calendarCollectionRef, newData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding Calendar data:", error);
        throw error;
    }
};
export const getCalendarData = async () => {
    try {
        const q = query(calendarCollectionRef);
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return data;
    } catch (error) {
        console.error("Error getting Calendar data:", error);
        throw error;
    }
};
export const getCalendarById = async (id) => {
    try {
        const docRef = doc(db, "Calendar", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting Calendar by ID:", error);
        throw error;
    }
};
export const updateCalendarData = async (id, calendarData) => {
    try {
        const docRef = doc(db, "Calendar", id);
        const updatedData = {};
        if (calendarData.date !== undefined) updatedData.date = calendarData.date;
        if (calendarData.sumenglish !== undefined) updatedData.sumenglish = calendarData.sumenglish;
        if (calendarData.sumhindi !== undefined) updatedData.sumhindi = calendarData.sumhindi;
        if (calendarData.remarkhindi !== undefined) updatedData.remarkhindi = calendarData.remarkhindi;
        if (calendarData.remarkenglish !== undefined) updatedData.remarkenglish = calendarData.remarkenglish;
        await updateDoc(docRef, updatedData);
    } catch (error) {
        console.error("Error updating Calendar data:", error);
        throw error;
    }
};
export const deleteCalendarData = async (id) => {
    try {
        const docRef = doc(db, "Calendar", id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting Calendar data:", error);
        throw error;
    }
};
export const deleteAllCalendarData = async () => {
    try {
        const querySnapshot = await getDocs(calendarCollectionRef);
        const deletePromises = querySnapshot.docs.map(doc =>
            deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        console.log(`Successfully deleted ${querySnapshot.size} calendar entries`);
        return querySnapshot.size;
    } catch (error) {
        console.error("Error deleting all Calendar data:", error);
        throw error;
    }
};
export { db };

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, deleteDoc } from 'firebase/firestore';
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
            imageURL: calendarData[5] || '',
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
        const sortedData = data.sort((a, b) => {
            return a.date.localeCompare(b.date);
        });
        return sortedData;
    } catch (error) {
        console.error("Error getting Calendar data:", error);
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
export const loginUser = async (username, password) => {
    try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({
                id: doc.id,
                ...doc.data()
            });
        });
        if (data.filter((item) => item.username === username && item.password === password).length) {
            localStorage.setItem('authToken', JSON.stringify({
                currentTime: Date.now(),
                expiresIn: 1 * 24 * 60 * 60 * 1000, // 1 days in milliseconds
            }));
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error getting Calendar data:", error);
        throw error;
    }
};
export const checkTokenValid = () => {
    const authData = JSON.parse(localStorage.getItem('authToken'));
    if (!authData) {
        return false;
    }
    const currentTime = Date.now();
    const tokenTime = authData.currentTime;
    const expirationPeriod = authData.expiresIn;
    return currentTime < (tokenTime + expirationPeriod);
}
export { db };
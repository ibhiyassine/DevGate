import { fetchUser, fetchUserSubcollection } from './fetchData';
import { getFirestore,collection,getDocs } from 'firebase/firestore';

async function getusers() {
    const users = [];
    const db = getFirestore();
    const usersCollection = collection(db, 'users');

    const snapshot = await getDocs(usersCollection);
    snapshot.forEach(doc => {
        users.push({ username: doc.id, ...doc.data() });
    });
    return users;
}

export async function getActivities() {
    const Data=[];
    const users = await getusers();
    for(const user of users){
        const userData=await fetchUser(user.username);
        //skills
        const skills=await fetchUserSubcollection(user.username,'skills');
        skills
            .filter(skill => skill.id !== "init")
            .forEach(skill => {
            Data.push({
                type:'skill',
                user: userData,
                skill: skill
            });
            });
        //projects
        const projects=await fetchUserSubcollection(user.username,'projects');
        projects
            .filter(project => project.id !== "init")
            .forEach(project => {
            Data.push({
                type:'project',
                user: userData,
                project: project
            });
            });

        //objectifs
        const objectifs=await fetchUserSubcollection(user.username,'objectifs');
        objectifs
            .filter(objectif => objectif.id !== "init")
            .forEach(objectif => {
            Data.push({
                type:'objectif',
                user: userData,
                objectif: objectif
            });
            });
    }
    
    return Data;
}

import { fetchUser, fetchUserSubcollection } from './fetchData'
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

export async function getActivities() {
  const db = getFirestore()
  const usersCollection = collection(db, 'users')

  const snapshot = await getDocs(usersCollection)
  const users = snapshot.docs.map((doc) => ({
    username: doc.id,
    ...doc.data(),
  }))

  const activitiesData = []

  const userPromises = users.map(async (user) => {
    const skills = await fetchUserSubcollection(user.username, 'skills')
    const projects = await fetchUserSubcollection(user.username, 'projects')
    const objectifs = await fetchUserSubcollection(user.username, 'objectifs')

    skills
      .filter((skill) => skill.id !== 'init')
      .forEach((skill) => {
        activitiesData.push({
          type: 'skill',
          modifiedDate: skill.modifiedDate,
          user: user,
          skill: skill,
        })
      })

    projects
      .filter((project) => project.id !== 'init')
      .forEach((project) => {
        activitiesData.push({
          type: 'project',
          modifiedDate: project.modifiedDate,
          user: user,
          project: project,
        })
      })

    objectifs
      .filter((objectif) => objectif.id !== 'init')
      .forEach((objectif) => {
        activitiesData.push({
          type: 'objectif',
          modifiedDate: objectif.modifiedDate,
          user: user,
          objectif: objectif,
        })
      })
  })

  await Promise.all(userPromises)

  activitiesData.sort((a, b) => b.modifiedDate - a.modifiedDate)

  return activitiesData
}

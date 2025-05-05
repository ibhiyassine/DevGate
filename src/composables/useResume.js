import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

export function useResume() {
  const generateResume = async (userData, currentBio) => {
    try {
      // Fetch all user data
      const userProjectsRef = collection(db, 'users', userData.username, 'projects')
      const userSkillsRef = collection(db, 'users', userData.username, 'skills')
      const userObjectivesRef = collection(db, 'users', userData.username, 'objectifs')

      const projectsSnapshot = await getDocs(userProjectsRef)
      const skillsSnapshot = await getDocs(userSkillsRef)
      const objectivesSnapshot = await getDocs(userObjectivesRef)

      const projects = projectsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((project) => project.id !== 'init' && project.title)

      const skills = skillsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((skill) => skill.id !== 'init' && skill.title)

      const objectives = objectivesSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((objective) => objective.id !== 'init' && objective.title)

      // Format according to JSON Resume schema
      const resumeData = {
        basics: {
          name: userData.fullname || userData.fullName,
          label: 'Developer',
          email: userData.email,
          username: userData.username,
          summary: currentBio,
          profiles: [
            {
              network: 'DevGate',
              username: userData.username,
              url: window.location.origin + '/profile/' + userData.username,
            },
          ],
        },
        skills: skills.map((skill) => ({
          name: skill.title,
          level: skill.level === 1 ? 'Beginner' : skill.level === 2 ? 'Intermediate' : 'Expert',
        })),
        projects: projects.map((project) => ({
          name: project.title,
          description: project.description,
          url: project.githubLink || '',
          keywords: project.stack || [],
          startDate: project.createdAt?.toDate
            ? project.createdAt.toDate().toISOString().split('T')[0]
            : '',
        })),
      }

      // Direct download as JSON file
      const dataStr = JSON.stringify(resumeData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

      const exportFileDefaultName = `${userData.username}_resume.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      linkElement.remove()

      return true
    } catch (error) {
      console.error('Error generating resume:', error)
      throw new Error('Failed to generate resume. Please try again.')
    }
  }

  return {
    generateResume,
  }
}

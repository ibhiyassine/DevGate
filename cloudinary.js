import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen'
import { fill } from '@cloudinary/url-gen/actions/resize'
// Create a Cloudinary instance and set your cloud name.
export const cld = new Cloudinary({
  cloud: {
    cloudName: 'devgate',
    apiKey: 984758491762867,
    apiSecret: 'RnvgW3dNCsiH48Gd4RD7IR8KUlA',
  },
})

export async function getPfp(username) {
  const publicId = 'users/' + username;
  try {
    const response = await fetch(`https://res.cloudinary.com/devgate/image/upload/${publicId}.png`);
    if (response.ok) {
      const myImg = cld.image(publicId);
      myImg.format('png');
      myImg.resize(fill().width(250).height(250));
      console.log(myImg);
      return myImg;
    } else {
      console.warn(`Image not found for username: ${username}`);
      return null;
    }
  } catch (error) {
    console.error('Error checking image existence:', error);
    return null;
  }
}
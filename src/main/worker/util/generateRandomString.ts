export default function generateRandomString(length = 64): string {
  let randomString = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    randomString += String.fromCharCode(65 + Math.floor(Math.random() * 25));
  }

  return randomString;
}

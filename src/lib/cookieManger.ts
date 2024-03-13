export function getCookieValue(cname: string) {
  const cookies = document.cookie.split(';');
  let returnVal;
  for (const cookie of cookies) {
    if (!cookie) continue;
    const cookieKey = cookie.split('=')[0].trim();
    const cookieValue = cookie.split('=')[1].trim();
    if (cookieKey === cname) {
      returnVal = cookieValue;
    }
  }
  return returnVal;
}
export function setCookie(key: string, val: string) {
  document.cookie = `${key}=${val};domain=ugix.org.in`;
}

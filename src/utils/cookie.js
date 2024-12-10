// 设置cookie方法
export const setCookie = (key, value, expires, path = '/') => {
    let date = new Date();
    date.setTime(date.getTime() - 8 * 3600 * 1000 + expires * 1000 * 3600 * 24)
    document.cookie = `${key}=${value};expires=${date};path=${path}`;
}
// 获取cookie
export const getCookie = (key) => {
    let cookies = document.cookie
    let arr = cookies.split('; ');
    for (let i = 0; i < arr.length; i++) {
        let brr = arr[i].split('=');
        if (brr[0] === key)
            return brr[1]
    }
}
// 删除cookie
export const removeCookie = (key, path = '/') => {
    setCookie(key, '', -1, path); // 设置cookie过期就是删除
}
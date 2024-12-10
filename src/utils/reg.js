function createReg(reg) {
    return (value) => reg.test(value);
}

export const usernameReg = createReg(/^(?=.*[a-zA-Z])[a-zA-Z0-9]{3,8}$/);

export const passwordReg = createReg(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+{}:"<>?`~-]{6,16}$/);

export const englishDigitsReg = createReg(/^[a-zA-Z0-9]+$/);

export const hasEnglishReg = createReg(/[a-zA-Z]/);

export const ageReg = createReg(/^(?:[7-9]|[1-9][0-9]|1[01][0-9]|110)$/);

export const phoneReg = createReg(/^1[3-9]\d{9}$/);

export const emailReg = createReg(/(^[1-9]\d{4,9}@qq\.com$)|(^[a-zA-Z]\w{5,17}@(126|163)\.com$)/);
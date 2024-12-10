
import axios from "@/http"
import { REPORTADD, REPORTCREATE, REPORTDEL, REPORTDOWNLOAD, REPORTEDIT, REPORTEXPORT, REPORTINFO, REPORTLIST, SUBJECTLIST, TEMPLATEADD, TEMPLATEDEL, TEMPLATEEDIT, TEMPLATEEXPORT, TEMPLATEINFO, TEMPLATELIST, TEMPLATEOFFICIALLIST, USERADD, USERCHECKLOGIN, USEREDIT, USERINFO, USERLOGIN, USERLOGOUT, USERPWD } from "./url"

//用户相关
export const loginUser = (data) => {
    return axios.post(USERLOGIN, data);
}
export const logoutUser = () => {
    return axios.post(USERLOGOUT);
}
export const checkLogin = () => {
    return axios.get(USERCHECKLOGIN);
}
export const registerUser = (data) => {
    return axios.post(USERADD, data);
}
export const editUser = (data) => {
    return axios.put(USEREDIT, data);
}
export const getUserInfo = () => {
    return axios.get(USERINFO);
}
export const changePassword = (data) => {
    return axios.post(USERPWD, data);
}

//报告相关
export const addReport = () => {
    return axios.post(REPORTADD);
}
export const createReport = (file_id, data) => {
    return axios.post(REPORTCREATE + file_id, data);
}
export const editReport = (file_id, data) => {
    return axios.put(REPORTEDIT + file_id, data);
}
export const delReport = (file_id) => {
    return axios.delete(REPORTDEL + file_id);
}
export const getReportInfo = (file_id) => {
    return axios.get(REPORTINFO + file_id);
}
export const getReportList = () => {
    return axios.get(REPORTLIST);
}
export const exportReport = (file_id, format) => {
    return axios({
        url: REPORTEXPORT + file_id,
        method: 'POST',
        data: { format },
        headers: { 'Cache-Control': 'no-cache' },
        responseType: 'blob',
    });
}
export const downloadReport = (file_id) => {
    return axios({
        url: REPORTDOWNLOAD + file_id,
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        responseType: 'blob',
    });
}

//模板相关
export const addTemplate = () => {
    return axios.post(TEMPLATEADD);
}
export const editTemplate = (tempalte_id, data) => {
    return axios.put(TEMPLATEEDIT + tempalte_id, data);
}
export const delTemplate = (tempalte_id) => {
    return axios.delete(TEMPLATEDEL + tempalte_id);
}
export const getTemplateInfo = (tempalte_id) => {
    return axios.get(TEMPLATEINFO + tempalte_id);
}
export const getTemplateList = () => {
    return axios.get(TEMPLATELIST);
}
export const getOfficialTemplateList = () => {
    return axios.get(TEMPLATEOFFICIALLIST);
}
export const exportTemplate = (template_id, format) => {
    return axios({
        url: TEMPLATEEXPORT + template_id,
        method: 'POST',
        data: { format },
        headers: { 'Cache-Control': 'no-cache' },
        responseType: 'blob',
    });
}

//学科相关
export const getSubjectList = () => {
    return axios.get(SUBJECTLIST);
}
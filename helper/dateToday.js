const datetimeNow = new Date();
const year = datetimeNow.getFullYear();
const month = datetimeNow.getMonth() + 1;
const date = datetimeNow.getDate();
const hour = datetimeNow.getHours();
const minute = datetimeNow.getMinutes();

module.exports = [
    `${year}-${month < 10? `0${month}`:month}-${date < 10? `0${date}`:date}`,
    `${hour < 10? `0${hour}`:hour}:${minute < 10? `0${minute}`:minute}`
];
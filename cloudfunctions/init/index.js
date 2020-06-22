const tcb = require("@cloudbase/node-sdk");

const cloud = tcb.init({
  env: "env-jsldxgkx",
});
const db = cloud.database();
const _ = db.command;
const MAX_LIMIT = 100;

exports.main = async (event, context) => {
  let res = {};
  const auth = cloud.auth().getUserInfo();
  const uid = auth.uid;
  const countResult = await db.collection('advice').where({ _openid: uid }).count();
  const total = countResult.total;
  const batchTimes = Math.ceil(total / 100);
  const tasks = [];
  for (let i = 0; i < batchTimes; i++) {
    const promise = await db.collection('advice').where({ _openid: uid }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).orderBy('adddue', 'desc').get();
    tasks.push(promise);
  }
  res.list = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  }).data;
  res.code = 0;
  return res;
};
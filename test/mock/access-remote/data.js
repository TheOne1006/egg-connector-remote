'use strict';

const user1 = {
  id: 1,
  username: 'user1',
  password: 'pwd',
  desc: null,
};
const user2 = {
  id: 2,
  username: 'user2',
  password: 'pwd',
  desc: null,
};
const userAdmin = {
  id: 3,
  username: 'admin',
  password: 'pwd',
};

const article1 = {
  id: 1,
  title: 'title1',
  desc: 'desc1',
  content: 'content1 belong user 2',
  userId: user1.id,
};

const article2 = {
  id: 2,
  title: 'title2',
  desc: 'desc2',
  content: 'content2 belong user 2',
  userId: user2.id,
};

const article3 = {
  id: 3,
  title: 'title3',
  desc: 'desc3',
  content: 'content3 belong user 1',
  userId: user1.id,
};

const role1 = {
  id: 1,
  name: 'user',
  desc: '用户',
};

const role2 = {
  id: 2,
  name: 'admin',
  desc: '超级管理员',
};

const roleMapping1 = {
  id: 1,
  principalType: 'USER',
  principalId: 1,
  roleId: 1,
};
const roleMapping2 = {
  id: 2,
  principalType: 'USER',
  principalId: 2,
  roleId: 1,
};
const roleMapping3 = {
  id: 3,
  principalType: 'USER',
  principalId: 3,
  roleId: 2,
};
const initUsers = [ user1, user2, userAdmin ];
const initArticles = [ article1, article2, article3 ];
const initRoles = [ role1, role2 ];
const initRoleMappings = [ roleMapping1, roleMapping2, roleMapping3 ];

module.exports = {
  initUsers,
  initArticles,
  initRoles,
  initRoleMappings,
};

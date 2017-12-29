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

const role3 = {
  id: 3,
  name: 'create_user',
  desc: '创建者',
};

const role4 = {
  id: 4,
  name: 'update_user',
  desc: '更新者',
};

const roleMapping1 = {
  id: 1,
  principalType: 'USER',
  principalId: user1.id,
  roleId: role1.id,
};
const roleMapping2 = {
  id: 2,
  principalType: 'USER',
  principalId: user2.id,
  roleId: role1.id,
};
const roleMapping3 = {
  id: 3,
  principalType: 'USER',
  principalId: userAdmin.id,
  roleId: role2.id,
};
const roleMapping4 = {
  id: 4,
  principalType: 'USER',
  principalId: user1.id,
  roleId: role3.id,
};
const roleMapping5 = {
  id: 5,
  principalType: 'USER',
  principalId: user2.id,
  roleId: role4.id,
};
const initUsers = [ user1, user2, userAdmin ];
const initArticles = [ article1, article2, article3 ];
const initRoles = [ role1, role2, role3, role4 ];
const initRoleMappings = [ roleMapping1, roleMapping2, roleMapping3, roleMapping4, roleMapping5 ];

module.exports = {
  initUsers,
  initArticles,
  initRoles,
  initRoleMappings,
};

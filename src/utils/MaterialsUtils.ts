export default {
  getMaterialAmount(materials, id) {
    return materials[id] ? materials[id].amount : 0;
  },
};

import path from "path";
export default () => ({
  migrations: {
    path: path.join(__dirname, "migrations"),
  },
});

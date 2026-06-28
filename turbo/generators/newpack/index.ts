export const options = {
  description: "add a new package",
  prompts: [
    {
      type: "input",
      name: "name",
      message: "package name please",
    },
  ],
  actions: [
    {
      type: "addMany",
      destination: "packages/{{name}}",
      templateFiles: ["newpack/template/**/*.hbs"],
      base: "newpack/template",
    },
  ],
};

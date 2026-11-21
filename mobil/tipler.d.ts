declare module "*.css";
declare module "*.module.css" {
  const s: Record<string, string>;
  export default s;
}

export interface ServiceConfig {
  name: string;
  prefix: string;
  target: string;
  pathRewrite: Record<string, string>;
}

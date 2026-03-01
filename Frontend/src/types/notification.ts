export interface Notification {
  type: "budget" | "threshold" | "system";
  title: string;
  message: string;
  time: string;
  severity?: "low" | "medium" | "high";
  read?: boolean;
}

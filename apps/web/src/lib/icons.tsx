import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bike,
  Camera,
  CarFront,
  CircleHelp,
  House,
  Instagram,
  Mail,
  MapPinned,
  MessageCircle,
  MessageCircleMore,
  MessageSquare,
  MessagesSquare,
  PlaneLanding,
  Sparkles
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  mail: Mail,
  "message-circle-more": MessageCircleMore,
  "message-square": MessageSquare,
  "messages-square": MessagesSquare,
  "message-circle": MessageCircle,
  instagram: Instagram,
  map: MapPinned,
  "car-front": CarFront,
  "plane-landing": PlaneLanding,
  bike: Bike,
  sparkles: Sparkles,
  house: House,
  arrow: ArrowRight,
  camera: Camera
};

export function getIcon(name: string) {
  return icons[name] ?? CircleHelp;
}

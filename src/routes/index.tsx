import { createFileRoute } from "@tanstack/react-router";
import { StarType } from "@/game/StarType";

export const Route = createFileRoute("/")({ component: StarType });

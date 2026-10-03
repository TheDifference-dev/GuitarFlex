// Tam olarak yazılmış kurslar. Burada olmayan teknikler techniques.ts seviyelerinden üretilir.
import type { Course } from "../types.ts";
import { alternatePickingCourse } from "./alternate-picking.ts";
import { legatoCourse } from "./legato.ts";
import { sweepCourse } from "./sweep.ts";
import { tappingCourse } from "./tapping.ts";

export const FULL_COURSES: Course[] = [alternatePickingCourse, legatoCourse, sweepCourse, tappingCourse];

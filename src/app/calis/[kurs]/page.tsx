import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CourseView from "@/components/CourseView";
import { assetUrl, getCourse } from "@/lib/courses";

export async function generateMetadata(props: PageProps<"/calis/[kurs]">): Promise<Metadata> {
  const { kurs } = await props.params;
  return { title: (await getCourse(kurs))?.title ?? "Kurs" };
}

export default async function CoursePage(props: PageProps<"/calis/[kurs]">) {
  const { kurs } = await props.params;
  const course = await getCourse(kurs);
  if (!course) notFound();
  return <CourseView course={course} image={assetUrl(course.image)} />;
}

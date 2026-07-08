import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useAppNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    navigate: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    back: () => router.back(),
    pathname,
    searchParams,
  };
}

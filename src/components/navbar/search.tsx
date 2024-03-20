"use client";

import { SearchFilter } from "@/components/navbar/search-filter";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounceFunction } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { SearchSchema } from "@/schemas";
import { Loader2, SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { DateRange } from "react-day-picker";

interface TagOption {
  value: string;
  label: string;
}

export function Search() {
  // TODO: Search input should probably be set in state, but currently can't get it to work properly
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isStrictSearch, setIsStrictSearch] = useState<boolean | undefined>();
  const [sortBy, setSortBy] = useState<"asc" | "desc" | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const inputValueArray = inputValue
      .trim()
      .split(",")
      .map((word) => word.trim());
    const lastSearchValue = inputValueArray[inputValueArray.length - 1];
    if (lastSearchValue.length >= 3) {
      startTransition(async () => {
        const res = await fetch(`/api/tags?tag=${lastSearchValue}`);
        if (!res.ok) {
          setSearchSuggestions([]);
        } else {
          const data = await res.json();
          const results = data.map((tag: TagOption) => tag.value);
          setSearchSuggestions(results);
        }
      });
    } else {
      setSearchSuggestions([]);
    }
  };

  const debouncedHandleChange = useDebounceFunction(handleChange, 300);

  const handleClick = (suggestion: string) => {
    const searchBar = document.getElementById("search") as HTMLInputElement;

    if (searchBar) {
      const inputValueArray = searchBar.value
        .trim()
        .split(",")
        .map((word: string) => word.trim());

      inputValueArray.splice(inputValueArray.length - 1, 1, suggestion);

      const newInputValue = inputValueArray.join(", ") + ", ";

      searchBar.value = newInputValue;

      setSearchSuggestions([]);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & { search: { value: string } };
    const searchValue = target.search.value;

    const searchObj = {
      query: searchValue || undefined,
      isStrictSearch,
      sortBy,
      dateRange,
    };

    const validatedFields = SearchSchema.safeParse(searchObj);
    if (validatedFields.success) {
      const { query, isStrictSearch, sortBy, dateRange } = validatedFields.data;
      const params = new URLSearchParams();
      params.set("query", query || "");
      if (isStrictSearch) {
        params.set("strict", isStrictSearch.toString());
      }
      if (sortBy) {
        params.set("sort", sortBy);
      }
      if (dateRange) {
        params.set("from", dateRange.from.toISOString());
        dateRange.to && params.set("to", dateRange.to.toISOString());
      }

      if (pathname.includes("/post/")) {
        router.push(`/home?${params.toString()}`);
      } else {
        router.replace(`${pathname}?${params.toString()}`);
      }
    } else if (validatedFields.error) {
      console.error(validatedFields.error);
    }
  };

  const handleStrictSearch = (value: boolean) => {
    setIsStrictSearch(value);
  };

  const handleSortBy = (value: string) => {
    if (value === "asc" || value === "desc" || value === undefined) {
      setSortBy(value);
    } else {
      setSortBy(undefined);
    }
  };

  if (pathname.includes("/albums") || pathname.includes("/favorites")) {
    return null;
  }

  return (
    <div className="relative flex w-full max-w-screen-sm gap-x-2">
      <form
        onSubmit={handleSubmit}
        className="relative w-full"
        autoComplete="off"
      >
        <Button
          size="icon"
          variant="link"
          type="submit"
          aria-label="Search"
          className="absolute right-0 top-0 hidden text-muted-foreground hover:text-foreground sm:block"
        >
          <SearchIcon strokeWidth={3} />
        </Button>
        <Input
          placeholder="Search for tags"
          minLength={3}
          className="peer flex-grow placeholder:italic"
          name="search"
          onChange={debouncedHandleChange}
          defaultValue={searchParams.get("query")?.toString()}
          id="search"
        />
        <div
          className={cn(
            "invisible absolute mt-2 flex h-9 w-full items-center justify-center rounded-md border bg-background",
            isPending && "peer-focus:visible",
          )}
        >
          <Loader2 className="animate-spin" />
        </div>
        <div
          className={cn(
            "invisible absolute mt-2 flex min-h-9 w-full flex-wrap items-center justify-center rounded-md border bg-background italic text-muted-foreground",
            searchSuggestions.length === 0 &&
              !isPending &&
              "peer-focus:visible",
          )}
        >
          To search for more than one tag, separate each tag with a comma.
        </div>
        <div
          className={cn(
            "invisible absolute mt-2 h-fit w-full",
            searchSuggestions.length > 0 && !isPending && "peer-focus:visible",
          )}
        >
          <ScrollArea className="rounded-md border bg-background">
            <ul className="max-h-40 w-full">
              {searchSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onMouseDown={() => handleClick(suggestion)}
                  className="flex h-8 items-center pl-2 hover:cursor-pointer hover:bg-secondary"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      </form>
      <SearchFilter
        isStrictSearch={isStrictSearch}
        handleStrictSearch={handleStrictSearch}
        sortBy={sortBy}
        handleSortBy={handleSortBy}
      >
        <DatePickerWithRange
          className="w-full"
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </SearchFilter>
    </div>
  );
}

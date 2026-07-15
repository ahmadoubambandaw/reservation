import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal `asChild` slot: merges the parent's props (notably className) onto a
 * single child element. Avoids pulling in @radix-ui/react-slot for our needs.
 */
export function Slot({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  if (!isValidElement(children)) {
    return null;
  }

  const child = Children.only(children) as ReactElement<
    HTMLAttributes<HTMLElement>
  >;

  return cloneElement(child, {
    ...props,
    ...child.props,
    className: cn(className, child.props.className),
  });
}

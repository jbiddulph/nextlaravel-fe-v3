
"use client"
import { useFormContext } from "react-hook-form";
import { 
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { InputHTMLAttributes } from "react";

type Props<S> = {
    fieldTitle: string;
    nameInSchema: keyof S;
    className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function InputWithLabel<S>({
    fieldTitle, nameInSchema, className, ...props
}: Props<S>) {
    const form = useFormContext();

    return (
        <FormField
            control={form.control}
            name={nameInSchema as string}
            render={({ field }) => (
                <FormItem>
                    <FormLabel
                        className="text-base"
                        htmlFor={nameInSchema as string}>
                        <Label htmlFor={field.name}>{fieldTitle}</Label>
                    </FormLabel>
                    <FormControl>
                        <Input 
                            id={nameInSchema as string}
                            className={`w-full max-w-xs disabled:text-blue-500 disabled:opacity-75 ${className}`}
                            {...props}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

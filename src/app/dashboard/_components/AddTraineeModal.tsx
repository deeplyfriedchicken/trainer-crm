"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HStack, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { Dialog, DialogBody } from "@/app/components/Dialog";
import { Field } from "@/app/components/Field";
import { Input } from "@/app/components/Input";
import { createTrainee } from "../trainees/actions";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export function AddTraineeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function handleClose() {
    if (isSubmitting) return;
    reset();
    onClose();
  }

  async function onSubmit(values: FormValues) {
    const result = await createTrainee(values);
    if ("error" in result) {
      setError("root", { message: result.error });
      return;
    }
    reset();
    onClose();
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Add Client" maxWidth={440}>
      <DialogBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap="16px" align="stretch">
            {errors.root && (
              <Alert status="error">{errors.root.message}</Alert>
            )}

            <Field
              label="Full Name"
              required
              invalid={!!errors.name}
              errorText={errors.name?.message}
            >
              <Input
                {...register("name")}
                placeholder="e.g. Jordan Mills"
                invalid={!!errors.name}
                disabled={isSubmitting}
              />
            </Field>

            <Field
              label="Email"
              required
              invalid={!!errors.email}
              errorText={errors.email?.message}
            >
              <Input
                {...register("email")}
                type="email"
                placeholder="client@example.com"
                invalid={!!errors.email}
                disabled={isSubmitting}
              />
            </Field>

            <HStack justify="flex-end" pt="8px">
              <Button
                variant="ghost"
                colorScheme="pink"
                onClick={handleClose}
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" colorScheme="pink" loading={isSubmitting}>
                Add Client
              </Button>
            </HStack>
          </VStack>
        </form>
      </DialogBody>
    </Dialog>
  );
}

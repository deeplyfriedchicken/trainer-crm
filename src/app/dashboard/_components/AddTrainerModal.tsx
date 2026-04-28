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
import { Select } from "@/app/components/Select";
import { createTrainer } from "../trainers/actions";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  role: z.enum(["trainer", "trainer_manager"]),
});

type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS = [
  { value: "trainer", label: "Trainer" },
  { value: "trainer_manager", label: "Trainer Manager" },
];

export function AddTrainerModal({
  isOpen,
  onClose,
  isAdmin,
}: {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "trainer" },
  });

  function handleClose() {
    if (isSubmitting) return;
    reset();
    onClose();
  }

  async function onSubmit(values: FormValues) {
    const result = await createTrainer(values);
    if ("error" in result) {
      setError("root", { message: result.error });
      return;
    }
    reset();
    onClose();
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Add Trainer" maxWidth={440}>
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
                placeholder="e.g. Taylor Smith"
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
                placeholder="trainer@example.com"
                invalid={!!errors.email}
                disabled={isSubmitting}
              />
            </Field>

            {isAdmin && (
              <Field label="Role" required>
                <Select
                  {...register("role")}
                  options={ROLE_OPTIONS}
                  colorScheme="cyan"
                  disabled={isSubmitting}
                />
              </Field>
            )}

            <HStack justify="flex-end" pt="8px">
              <Button
                variant="ghost"
                colorScheme="cyan"
                onClick={handleClose}
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" colorScheme="cyan" loading={isSubmitting}>
                Add Trainer
              </Button>
            </HStack>
          </VStack>
        </form>
      </DialogBody>
    </Dialog>
  );
}

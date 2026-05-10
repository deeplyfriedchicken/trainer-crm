import { Box, Stack } from "@chakra-ui/react";
import { Card, CardBody, CardHeader, CardTitle } from "@/app/components/Card";
import { PageHeader } from "@/app/components/PageHeader";
import { Text } from "@/app/components/Text";
import { getDocsBundle } from "@/lib/docs/registry";
import { RoutesTable } from "./_components/RoutesTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "API docs · trainer-crm",
  description:
    "Auto-generated index of REST routes, DB query helpers, and schema for AI agents and humans.",
};

export default async function DocsApiPage() {
  const { routes, queries, schemaMarkdown } = await getDocsBundle();

  return (
    <Box maxW="1100px" mx="auto" px={{ base: "16px", md: "32px" }} py="48px">
      <PageHeader
        title="API surface"
        subtitle={
          <>
            Auto-generated from <code>src/app/api/</code> and{" "}
            <code>src/db/queries/</code>. Also available as plaintext at{" "}
            <a
              href="/llms.txt"
              style={{ color: "var(--neon-cyan)", textDecoration: "underline" }}
            >
              /llms.txt
            </a>
            .
          </>
        }
      />

      <Stack gap="32px">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>REST routes</CardTitle>
          </CardHeader>
          <CardBody>
            <RoutesTable routes={routes} />
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>DB query helpers</CardTitle>
          </CardHeader>
          <CardBody>
            <Stack gap="20px">
              {queries.map((qf) => (
                <Box key={qf.file}>
                  <Text
                    variant="mono-sm"
                    color="var(--neon-text-muted)"
                    display="block"
                    mb="6px"
                  >
                    {qf.file}
                  </Text>
                  <Text
                    variant="mono-sm"
                    as="pre"
                    display="block"
                    p="12px 14px"
                    bg="var(--neon-surface-2)"
                    border="1px solid var(--neon-border)"
                    borderRadius="8px"
                    lineHeight="1.6"
                    color="var(--neon-text)"
                    overflowX="auto"
                    whiteSpace="pre"
                  >
                    {qf.functions
                      .map(
                        (fn) => `${fn.isAsync ? "async " : ""}${fn.signature}`,
                      )
                      .join("\n")}
                  </Text>
                </Box>
              ))}
              {queries.length === 0 && (
                <Text color="var(--neon-text-dim)">No query files found.</Text>
              )}
            </Stack>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Database schema</CardTitle>
          </CardHeader>
          <CardBody>
            <Text
              variant="mono-sm"
              as="pre"
              display="block"
              p="16px 18px"
              bg="var(--neon-surface-2)"
              border="1px solid var(--neon-border)"
              borderRadius="8px"
              lineHeight="1.55"
              color="var(--neon-text)"
              overflowX="auto"
              whiteSpace="pre"
            >
              {schemaMarkdown}
            </Text>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}

import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { colors, radius, spacing, useToast, MDBadge, MDButton, MDModal, MDSkeleton, MDTable, MDText, type MDTableColumn } from '@/design-system';
import { useApproveSellerApplication, useSellerApplications } from '@/features/sellerOnboarding';
import type { SellerApplication } from '@/types';

const STATUS_LABEL: Record<SellerApplication['status'], string> = {
  submitted: 'Submitted',
  verification: 'KYB / GST Verification',
  catalogue_setup: 'Catalogue Setup',
  console_access: 'Console Access Granted',
};

const STATUS_TONE: Record<SellerApplication['status'], 'success' | 'brand' | 'neutral' | 'warning'> = {
  submitted: 'neutral',
  verification: 'warning',
  catalogue_setup: 'brand',
  console_access: 'success',
};

export default function SellerApplications() {
  const toast = useToast();
  const { data: applications, isLoading } = useSellerApplications();
  const approve = useApproveSellerApplication();
  const [credentials, setCredentials] = useState<{ email: string; temporaryPassword: string } | null>(null);

  const handleApprove = (application: SellerApplication) => {
    approve.mutate(application, {
      onSuccess: (result) => {
        setCredentials({ email: application.email, temporaryPassword: result.temporaryPassword });
        toast.show(`Console access granted to ${application.companyName}.`, 'success');
      },
      onError: (err) => toast.show((err as Error).message || 'Could not approve this application.', 'error'),
    });
  };

  const columns: MDTableColumn<SellerApplication>[] = [
    {
      key: 'company',
      label: 'Company',
      width: 220,
      render: (a) => (
        <View>
          <MDText variant="bodySm" weight="600">
            {a.companyName}
          </MDText>
          <MDText variant="caption" tone="tertiary">
            {a.referenceNumber}
          </MDText>
        </View>
      ),
    },
    { key: 'type', label: 'Business Type', width: 160, render: (a) => <MDText variant="bodySm">{a.businessType}</MDText> },
    {
      key: 'contact',
      label: 'Contact',
      width: 200,
      render: (a) => (
        <View>
          <MDText variant="bodySm">{a.contactName}</MDText>
          <MDText variant="caption" tone="tertiary">
            {a.email}
          </MDText>
        </View>
      ),
    },
    {
      key: 'submitted',
      label: 'Submitted',
      width: 130,
      render: (a) => <MDText variant="bodySm">{new Date(a.submittedAt).toLocaleDateString()}</MDText>,
    },
    { key: 'status', label: 'Status', width: 170, render: (a) => <MDBadge label={STATUS_LABEL[a.status]} tone={STATUS_TONE[a.status]} /> },
    {
      key: 'actions',
      label: 'Actions',
      width: 220,
      render: (a) =>
        a.status === 'console_access' ? (
          <MDText variant="caption" tone="tertiary">
            Account provisioned
          </MDText>
        ) : (
          <MDButton
            label="Approve & Grant Access"
            size="sm"
            onPress={() => handleApprove(a)}
            loading={approve.isPending}
          />
        ),
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          Seller Applications
        </MDText>
        <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.xl, maxWidth: 640 }}>
          Review applications from the seller onboarding form. Approving provisions a real seller console
          account — a seller can never grant itself access.
        </MDText>

        {isLoading ? (
          <MDSkeleton height={300} />
        ) : (
          <MDTable columns={columns} data={applications ?? []} keyExtractor={(a) => a.id} emptyTitle="No seller applications yet" />
        )}
      </View>

      <MDModal visible={!!credentials} onClose={() => setCredentials(null)} title="Console Access Granted" maxWidth={420}>
        {credentials ? (
          <View style={{ gap: spacing.md }}>
            <MDText variant="bodySm" tone="secondary">
              Prototype simulation — a production flow would email these credentials directly to the seller.
              Share them with {credentials.email} for now.
            </MDText>
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 4 }}>
              <MDText variant="bodySm">Email: <MDText weight="700">{credentials.email}</MDText></MDText>
              <MDText variant="bodySm">Temporary password: <MDText weight="700">{credentials.temporaryPassword}</MDText></MDText>
            </View>
            <MDButton label="Done" onPress={() => setCredentials(null)} />
          </View>
        ) : null}
      </MDModal>
    </ScrollView>
  );
}

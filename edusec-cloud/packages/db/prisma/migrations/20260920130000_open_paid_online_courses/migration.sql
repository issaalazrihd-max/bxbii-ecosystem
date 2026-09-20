UPDATE "courses"
SET "status"='OPEN',"ar_format"='أونلاين',"en_format"='Online',"updated_at"=CURRENT_TIMESTAMP
WHERE "tenant_id"='00000000-0000-0000-0000-000000000001'
AND "slug" IN (
'physical-ai-fundamentals',
'computer-vision-for-physical-ai',
'edge-ai-embedded-intelligence',
'robotics-control-and-perception',
'semiconductor-ic-design-fundamentals',
'digital-ic-design-rtl',
'systemverilog-functional-verification',
'semiconductor-packaging-fundamentals',
'advanced-semiconductor-packaging',
'semiconductor-assembly-testing-reliability'
);
import SimpleUpload from '@/components/SimpleUpload';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const UploadDemoPage = () => {
  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-bg-col text-text-col p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Simple S3 Upload Demo
          </h1>
          <SimpleUpload />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default UploadDemoPage;

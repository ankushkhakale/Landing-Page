"use client";

import { FirebaseTest } from '@/components/firebase-test';
// import Dialog01 from "@/components/ui/ruixen-dialog";

export default function TestFirebasePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Authentication Test</h1>
      <FirebaseTest />
    </div>
  );
}

import Dialog01 from "@/components/ui/ruixen-dialog";
import debounce from "lodash.debounce";

const DemoOne = () => {
  return <Dialog01 open={false} onOpenChange={function (open: boolean): void {
    throw new Error('Function not implemented.');
  } } initialValues={{
    full_name: '',
    username: '',
    email: '',
    contact_no: '',
    grade_level: '',
    date_of_birth: '',
    avatar_url: undefined
  }} onSave={function (values: { full_name: string; username: string; email: string; contact_no: string; grade_level: string; date_of_birth: string; avatar_url?: string; }): void {
    throw new Error('Function not implemented.');
  } } />;
};

export { DemoOne }; 
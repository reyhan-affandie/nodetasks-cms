export function ErrorsHandling({ error }: { readonly error: string | null | undefined}) {
  if (!error) return null;
  return <div className="p-2 bg-red-50 text-red-800 mt-4 rounded-md text-sm border border-red-200">{error}</div>;
}

export function ErrorsZod({ error }: { error: string[] | Record<string, string[]> | undefined}) {
  if (!error) return null;

  const messages = Array.isArray(error) ? error : Object.values(error).flat(); // flatten the object into an array of messages

  return messages.map((msg, index) => (
    <div key={index} className="p-2 bg-red-50 text-red-800 mt-2 rounded-md text-sm border border-red-200">
      {msg}
    </div>
  ));
}

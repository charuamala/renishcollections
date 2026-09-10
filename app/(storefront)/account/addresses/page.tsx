import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/authorization";
import { getAddressesForUser } from "@/services/address.service";
import { AddressList } from "@/components/account/address-list";
import { AddNewAddress } from "@/components/account/add-new-address";

export const metadata: Metadata = {
  title: "My Addresses",
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const user = await requireUserOrRedirect("/account/addresses");
  const addresses = await getAddressesForUser(user.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-charcoal">My Addresses</h1>
      </div>

      <div className="mt-6">
        <AddressList addresses={addresses} />
      </div>

      <div className="mt-8">
        <AddNewAddress />
      </div>
    </div>
  );
}

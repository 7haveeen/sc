<script lang="ts">
  import { Separator } from "@/components/ui/separator";
  import { goto } from "$app/navigation";
  import * as Alert from "$lib/components/ui/alert";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Collapsible from "$lib/components/ui/collapsible";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import * as Tabs from "$lib/components/ui/tabs";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import CircleCheck from "lucide-svelte/icons/circle-check";
  import Lock from "lucide-svelte/icons/lock";
  import ShieldCheck from "lucide-svelte/icons/shield-check";

  let paymentMethod = $state("");
  let country = $state("uk");
  let saveInfo = $state(false);
  let shippingOpen = $state(false);
  let promoOpen = $state(false);
  let walletOpen = $state(false);
  const walletBalance = $state(150.0);
  let isProcessing = $state(false);
  let isSuccess = $state(false);
  let showDialog = $state(false);

  function handleTabChange(value: string) {
    paymentMethod = value;
    setTimeout(() => {
      const content = document.querySelector(`[data-value=${value}]`);
      if (content) {
        content.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      }
    }, 100);
  }

  function simulatePayment() {
    showDialog = true;
    isProcessing = true;
    isSuccess = false;

    // Simulate payment processing
    setTimeout(() => {
      isProcessing = false;
      isSuccess = true;

      // Close dialog after showing success
      setTimeout(() => {
        showDialog = false;
        // Redirect to success page
        goto("/success");
      }, 3000);
    }, 2000);
  }
</script>

<div class="grid min-h-svh grid-rows-[auto_1fr_auto]">
  <!-- Header -->
  <header class="bg-card sticky top-0 z-50 backdrop-blur-xl">
    <div class="container flex h-14 items-center justify-between px-3 md:px-8">
      <a href="/" class="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
        <ArrowLeft class="size-4" />
        <span class="text-sm font-semibold">Back to Cart</span>
      </a>
      <div class="flex items-center gap-2">
        <span class="hidden text-xs font-medium md:block">Secure Checkout</span>
        <Lock class="size-4 text-green-600 dark:text-green-500" />
      </div>
    </div>
  </header>

  <div class="container px-1 py-8 md:px-8">
    <!-- Order Summary -->
    <div class="mx-auto w-full max-w-[500px] space-y-5">
      <Card class="rounded-xl border-none shadow-sm">
        <CardContent class="p-4 md:p-6">
          <h2 class="mb-6 text-base font-bold md:text-lg">Summary</h2>

          <div class="grid gap-4">
            <!-- Subtotal -->
            <div class="flex items-center justify-between">
              <span class="text-xs md:text-sm">Subtotal</span>
              <span class="mr-3 text-xs font-medium md:text-sm">US $46.00</span>
            </div>

            <!-- Promo Code -->
            <Collapsible.Root open={promoOpen} onOpenChange={val => (promoOpen = val)}>
              <div class="flex items-center justify-between">
                <span class="text-xs md:text-sm">Promo code</span>
                <Collapsible.Trigger class="hover:text-accent-foreground flex items-center gap-1">
                  <span class="text-xs md:text-sm">Enter</span>
                  <ChevronDown class="size-3" />
                </Collapsible.Trigger>
              </div>
              <Collapsible.Content class="mt-2">
                <div class="overflow-hidden rounded-md shadow-sm">
                  <div class="flex">
                    <Input
                      placeholder="Enter promo code"
                      class="bg-muted dark:bg-muted/80 flex-1 rounded-none border-none text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      variant="ghost"
                      class="bg-muted hover:bg-brand/40 dark:bg-muted/80 dark:hover:bg-brand/40 rounded-none border-none px-4 text-xs font-medium"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </Collapsible.Content>
            </Collapsible.Root>

            {#if walletBalance > 0}
              <!-- Wallet Credit -->
              <Collapsible.Root open={walletOpen} onOpenChange={val => (walletOpen = val)}>
                <div class="flex items-center justify-between">
                  <span class="text-xs md:text-sm">Wallet Credit</span>
                  <Collapsible.Trigger class="hover:text-accent-foreground flex items-center gap-1">
                    <span class="text-xs md:text-sm">Enter</span>
                    <ChevronDown class="h-3 w-3" />
                  </Collapsible.Trigger>
                </div>
                <Collapsible.Content class="mt-2 space-y-1">
                  <div class="overflow-hidden rounded-md shadow-sm">
                    <div class="flex">
                      <Input
                        placeholder="Enter amount to use"
                        class="bg-muted dark:bg-muted/80 flex-1 rounded-none border-none text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Button
                        variant="ghost"
                        class="bg-muted dark:bg-muted/80 dark:hover:bg-brand/40 hover:bg-brand/40 rounded-none border-none px-4 text-xs font-medium"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                  <p class="text-muted-foreground text-[10px]">
                    Max Available: US ${walletBalance.toFixed(2)}
                  </p>
                </Collapsible.Content>
              </Collapsible.Root>
            {/if}

            <!-- Shipping Fee -->
            <Collapsible.Root open={shippingOpen} onOpenChange={val => (shippingOpen = val)}>
              <div class="flex items-center justify-between">
                <span class="text-xs md:text-sm">Shipping fee</span>
                <div class="flex items-center gap-1">
                  <span class="text-xs font-medium md:text-sm">US $31.18</span>
                  <Collapsible.Trigger>
                    <ChevronDown class="h-3 w-3" />
                  </Collapsible.Trigger>
                </div>
              </div>
              <Collapsible.Content class="mt-2">
                <div class="bg-muted/50 space-y-3 rounded-md p-3">
                  <div class="flex items-center justify-between text-[10px] md:text-xs">
                    <span>Original shipping fee</span>
                    <span class="font-medium">US $34.18</span>
                  </div>
                  <div class="flex items-center justify-between text-[10px] md:text-xs">
                    <span>Shipping discount</span>
                    <span class="font-medium">-US $3.00</span>
                  </div>
                  <Separator class="bg-muted/90 dark:bg-muted/60 my-2" />
                  <div class="flex items-center justify-between text-[10px] md:text-xs">
                    <span>Actual shipping fee</span>
                    <span class="font-medium">US $31.18</span>
                  </div>
                  <p class="text-muted-foreground text-[10px]">
                    Estimated delivery: 5-7 business days
                  </p>
                </div>
              </Collapsible.Content>
            </Collapsible.Root>

            <Separator class="bg-muted/80 dark:bg-muted/50" />

            <!-- Total -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold">Total</span>
              <span class="text-sm font-bold">US $77.18</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-xl border-none shadow-sm">
        <CardContent class="p-4 md:p-6">
          <div class="grid gap-3">
            <div class="flex items-center gap-2">
              <ShieldCheck class="size-4 text-[#062549] dark:text-white" />
              <h2 class="text-base font-semibold md:text-lg">7haven</h2>
            </div>

            <p class="text-muted-foreground text-xs">
              7haven protects payment information and only shares it with trusted service providers.
              Industry-standard measures are in place to safeguard personal data.
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Payment Section -->

      <Card class="rounded-xl border-none shadow-sm">
        <CardContent class="p-4 md:p-6">
          <div class="mb-6 grid gap-2">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold md:text-xl">Pay with</h2>
            </div>
            <p class="text-muted-foreground text-xs">Select payment option below</p>
          </div>

          <Tabs.Root value={paymentMethod} onValueChange={handleTabChange}>
            <Tabs.List class="grid h-auto grid-cols-3 gap-2 bg-transparent">
              <Tabs.Trigger
                value="ecocash"
                class="hover:text-accent-foreground hover:bg-muted/90 data-[state=active]:muted flex items-center justify-center gap-2 rounded-md border-none p-3.5 transition-all duration-200 data-[state=active]:shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-16"
                  viewBox="0 0 24 5"
                  fill-rule="evenodd"
                  stroke-linejoin="round"
                  stroke-miterlimit="2"
                ><path
                  d="M2.792.735H.858v1.041h1.781c.131 0 .229.029.292.088s.098.136.098.232-.032.175-.096.236-.162.091-.294.091H.858v1.205h2c.135 0 .237.031.305.094s.103.146.103.25-.035.182-.103.244-.17.094-.305.094H.526c-.187 0-.322-.041-.403-.125S0 3.968 0 3.784V.599C0 .476.018.375.055.297S.149.162.226.126.405.073.526.073h2.266c.136 0 .239.03.305.091s.099.14.099.238-.033.181-.099.242-.169.091-.305.094zm3.783 2.67c0 .098-.03.204-.089.315s-.148.218-.269.32-.271.182-.455.244-.39.092-.618.092c-.487 0-.868-.142-1.142-.426s-.41-.665-.41-1.144c0-.323.062-.609.187-.858s.307-.441.544-.577.52-.203.85-.203c.204 0 .391.03.562.09s.315.137.433.231.209.195.272.303.094.206.094.298-.035.175-.106.24-.155.098-.255.098c-.065 0-.12-.016-.164-.05s-.091-.089-.145-.164c-.097-.146-.198-.255-.303-.329s-.237-.11-.399-.11c-.234 0-.422.091-.564.273s-.214.431-.214.748c0 .148.018.284.054.409s.09.23.16.317.153.155.251.2.207.067.324.067c.158 0 .293-.035.406-.109s.212-.185.299-.336c.049-.088.1-.158.156-.208s.124-.075.205-.075c.096 0 .176.037.24.11s.096.152.096.234zm2.701-.627c0-.322-.071-.572-.212-.752s-.332-.268-.571-.268c-.154 0-.29.04-.407.12s-.208.197-.273.354-.094.338-.094.546.031.387.093.54.153.273.269.354.254.124.412.124c.239 0 .429-.091.571-.271s.212-.429.212-.747zm.792 0c0 .235-.036.452-.109.65s-.18.369-.319.512-.304.251-.497.328-.409.114-.65.114-.454-.039-.645-.116-.356-.187-.495-.33-.246-.313-.318-.509-.109-.412-.109-.649.037-.458.11-.656.179-.368.315-.509.303-.249.497-.324.41-.115.645-.115.456.038.65.116.362.187.5.329.245.312.317.508.108.413.108.651z"
                  fill="#00529c"
                /><path
                  d="M14.206 2.972c0 .134-.033.281-.099.437s-.172.312-.314.463-.324.275-.546.369-.48.141-.774.141c-.225 0-.428-.021-.611-.064s-.349-.108-.498-.197-.287-.207-.412-.355c-.112-.133-.207-.281-.286-.446s-.139-.341-.178-.527-.059-.386-.059-.596c0-.341.05-.646.149-.916s.241-.5.426-.692.402-.337.65-.438.514-.151.795-.151c.343 0 .649.069.916.206s.473.306.615.507.215.392.215.571c0 .098-.035.185-.104.26s-.153.112-.252.112c-.11 0-.192-.025-.247-.078s-.116-.141-.183-.268c-.112-.211-.243-.367-.395-.471s-.156-.156-.559-.156c-.353 0-.633.133-.843.401s-.313.649-.313 1.142c0 .329.046.604.138.823s.224.381.393.489.369.163.596.163c.247 0 .455-.062.626-.184s.299-.302.386-.539c.036-.112.082-.203.136-.273s.14-.105.26-.105c.101 0 .189.034.263.106s.109.16.109.266zm2.511-.176c-.115.041-.283.087-.504.134l-.458.104c-.085.022-.166.066-.242.13s-.117.155-.117.27.046.221.137.305.208.126.355.126c.156 0 .3-.035.432-.103s.229-.155.291-.264c.071-.12.106-.316.106-.589v-.113zm.053 1.141c-.191.149-.376.26-.554.334s-.378.112-.6.112c-.202 0-.38-.04-.533-.12s-.271-.189-.355-.326-.123-.285-.123-.445c0-.215.068-.4.205-.552s.325-.255.564-.306l.372-.078.511-.112.46-.122c-.01-.209-.051-.361-.125-.458s-.228-.146-.461-.146c-.201 0-.351.027-.452.083s-.189.14-.26.251l-.154.222c-.029.036-.094.053-.192.053-.088 0-.166-.029-.23-.085s-.097-.129-.097-.218c0-.139.05-.274.147-.405s.252-.239.46-.324.468-.127.778-.127c.347 0 .619.042.818.123s.338.211.421.389.122.412.122.705l-.001.472-.005.43c0 .148.025.302.074.464s.074.265.074.31c0 .081-.038.155-.114.221s-.162.101-.259.101c-.081 0-.162-.039-.24-.115s-.163-.186-.251-.331zm3.915-.586c0 .217-.053.404-.159.559s-.262.272-.47.352-.459.12-.755.12c-.283 0-.526-.043-.729-.13s-.352-.194-.447-.325-.145-.26-.145-.392c0-.086.031-.161.093-.222s.139-.093.233-.093c.083 0 .147.02.192.06s.086.098.127.172c.08.14.178.245.29.314s.266.104.461.104c.159 0 .288-.035.389-.105s.151-.15.151-.241c0-.139-.052-.24-.157-.304s-.278-.124-.519-.182c-.271-.067-.492-.137-.663-.213s-.307-.171-.409-.292-.153-.272-.153-.448c0-.159.046-.308.142-.448s.233-.254.417-.338.406-.125.666-.125c.205 0 .388.021.551.064s.298.099.407.17.192.151.248.237.086.172.086.255c0 .09-.03.164-.091.222s-.147.087-.258.087c-.082 0-.15-.023-.207-.069s-.122-.116-.195-.209c-.06-.077-.13-.139-.211-.185s-.191-.069-.33-.069-.261.03-.355.091-.142.136-.142.227c0 .083.034.151.104.204s.163.097.28.131l.486.128c.245.06.444.13.6.214s.273.18.353.293.119.241.119.386zm1.292-2.87v1.17c.099-.116.198-.207.293-.275s.201-.118.316-.151.241-.051.373-.051c.201 0 .378.042.534.127s.276.208.365.37c.056.094.093.2.112.317s.03.25.03.403v1.512c0 .157-.037.277-.109.357s-.168.122-.287.122c-.26 0-.391-.159-.391-.479V2.57c0-.252-.037-.447-.112-.582s-.218-.204-.428-.204c-.141 0-.268.04-.38.12s-.197.189-.252.328c-.043.117-.064.326-.064.627v1.044c0 .155-.036.274-.106.357s-.168.122-.293.122c-.26 0-.39-.159-.39-.479V.481c0-.16.033-.281.102-.36s.164-.12.288-.12.223.04.293.121.106.2.106.359z"
                  fill="#e2091c"
                /></svg
                >
              </Tabs.Trigger>
              <Tabs.Trigger
                value="innbucks"
                class="hover:text-accent-foreground hover:bg-muted/90 data-[state=active]:muted flex items-center justify-center gap-2 rounded-md border-none p-3.5 transition-all duration-200 data-[state=active]:shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-20 text-[#062549] dark:text-white"
                  viewBox="0 0 24 5"
                  fill-rule="evenodd"
                  stroke-linejoin="round"
                  stroke-miterlimit="2"
                ><circle cx="3.672" cy="3.672" r="1.153" fill="#da0c16" /><circle
                  cx="1.153"
                  cy="3.672"
                  r="1.153"
                  fill="#39b48e"
                /><circle cx="3.672" cy="1.153" r="1.153" fill="#8c4a97" /><circle
                  cx="1.153"
                  cy="1.153"
                  r="1.153"
                  fill="#f1b70e"
                /><g fill="currentColor" fill-rule="nonzero"
                ><path
                  d="M5.7290000916.7350000143h.6669999957v3.3020000458h-.6669999957zM8.85 4.036h-.633v-1.22c0-.258-.013-.426-.04-.501s-.071-.135-.132-.177-.134-.063-.219-.063c-.11 0-.208.03-.295.09s-.147.14-.179.239-.049.282-.049.549v1.083H6.67V1.645h.588v.351c.209-.27.472-.405.788-.405.14 0 .268.025.383.075s.203.115.263.193.1.166.123.265.035.241.035.426v1.486zm2.455 0h-.633v-1.22c0-.258-.014-.426-.041-.501s-.071-.135-.132-.177-.134-.063-.219-.063c-.11 0-.208.03-.295.09s-.147.14-.179.239-.049.282-.049.549v1.083h-.632V1.645h.587v.351c.209-.27.472-.405.789-.405.139 0 .267.025.382.075s.204.115.263.193.1.166.124.265.035.241.035.426v1.486zm.274-3.301h1.32c.261 0 .456.011.584.032s.243.068.345.137.185.161.253.276.101.243.101.386c0 .154-.041.296-.125.425s-.196.226-.339.291c.202.059.356.158.464.3s.162.307.162.497c0 .15-.034.296-.104.438s-.165.256-.286.34-.27.137-.447.157c-.111.012-.379.019-.804.022h-1.124V.735zm.666.549v.764h.437l.485-.011c.114-.014.203-.053.269-.119s.098-.151.098-.258-.028-.185-.085-.248-.14-.103-.251-.116c-.066-.008-.256-.012-.57-.012h-.383zm0 1.313v.883h.618l.457-.02c.099-.018.18-.062.242-.132s.093-.163.093-.28c0-.099-.024-.183-.072-.253s-.117-.119-.208-.15-.288-.048-.591-.048h-.539z"
                /><path
                  d="M16.206 4.036v-.358c-.087.128-.201.229-.343.302s-.292.11-.449.11-.305-.035-.433-.105-.22-.17-.277-.298-.085-.304-.085-.529V1.645h.633v1.099c0 .336.011.542.034.618s.066.136.128.18.139.067.234.067c.108 0 .205-.03.29-.089s.145-.133.176-.221.047-.303.047-.645V1.645h.633v2.391h-.588zm3.088-1.684l-.624.112c-.021-.124-.069-.218-.143-.281s-.095-.095-.29-.095c-.157 0-.283.055-.377.164s-.141.291-.141.546c0 .284.048.484.143.601s.224.176.384.176c.12 0 .219-.034.295-.103s.131-.186.163-.352l.621.106c-.064.285-.188.5-.371.646s-.429.218-.737.218c-.35 0-.629-.11-.837-.331s-.312-.526-.312-.916c0-.395.105-.702.314-.922s.491-.33.846-.33c.292 0 .523.062.695.188s.296.316.371.573zm.305 1.684V.735h.633v1.752l.741-.842h.779l-.817.873.876 1.518h-.682l-.602-1.074-.295.309v.765h-.633zm2.167-.682l.635-.097c.027.123.082.217.164.281s.199.095.347.095c.164 0 .287-.03.37-.09.055-.042.083-.098.083-.169 0-.048-.015-.088-.045-.119s-.102-.058-.212-.083c-.51-.113-.834-.216-.971-.309-.189-.129-.283-.308-.283-.538 0-.207.082-.382.245-.523s.418-.211.761-.211c.328 0 .571.053.73.16s.269.264.329.472l-.597.111c-.025-.093-.074-.165-.165-.214s-.173-.074-.305-.074c-.167 0-.286.023-.358.069-.048.033-.072.076-.072.129 0 .045.021.083.063.063.057.042.254.101.591.178s.572.17.706.281.198.27.198.471c0 .219-.092.407-.275.565s-.454.236-.813.236c-.326 0-.583-.066-.773-.198s-.315-.311-.373-.538z"
                /></g
                ></svg
                >
              </Tabs.Trigger>
              <Tabs.Trigger
                value="card"
                class="hover:text-accent-foreground hover:bg-muted/90 data-[state=active]:muted flex items-center justify-center gap-2 rounded-md border-none p-3.5 transition-all duration-200 data-[state=active]:shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6"
                  viewBox="0 0 24 16"
                  fill-rule="nonzero"
                  stroke-linejoin="round"
                  stroke-miterlimit="2"
                ><path
                  d="M1.231 0h21.538C23.449 0 24 .551 24 1.231v12.923c0 .68-.551 1.231-1.231 1.231H1.231c-.68 0-1.231-.551-1.231-1.231V1.231C0 .551.551 0 1.231 0z"
                  fill="#0e4595"
                /><path
                  d="M9.022 10.73l1.026-6.023h1.642l-1.027 6.023H9.022zm7.572-5.893c-.325-.122-.835-.253-1.471-.253-1.623 0-2.765.817-2.775 1.987-.009.866.816 1.349 1.438 1.637.64.295.854.483.851.747-.004.404-.51.588-.982.588-.657 0-1.006-.091-1.545-.316l-.212-.096-.23 1.349c.383.168 1.092.314 1.829.321 1.725 0 2.846-.807 2.859-2.058.006-.685-.432-1.206-1.379-1.636-.574-.279-.925-.465-.922-.747 0-.25.298-.518.941-.518.537-.008.926.109 1.229.231l.147.069.222-1.305zm4.225-.13H19.55c-.393 0-.687.107-.859.499l-2.439 5.52h1.724l.346-.905 2.103.003.199.902h1.524l-1.329-6.02v.001zm-2.013 3.889l.654-1.684c-.009.016.135-.348.218-.574l.111.519.38 1.739h-1.363zM7.628 4.707L6.02 8.814l-.171-.834c-.299-.963-1.231-2.005-2.274-2.527l1.47 5.268 1.737-.002 2.585-6.012H7.628"
                  fill="#fff"
                /><path
                  d="M4.521 4.706H1.873l-.021.126c2.06.498 3.423 1.703 3.989 3.151l-.576-2.768c-.1-.382-.388-.495-.744-.509"
                  fill="#f2ae14"
                /></svg
                >
                <span>Card</span>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="card" class="mt-6 space-y-4" data-value="card">
              <div class="space-y-2">
                <Label class="text-sm font-medium">Card information</Label>
                <div
                  class="divide-y-2 divide-transparent overflow-hidden rounded-md shadow-sm dark:divide-y"
                >
                  <Input
                    placeholder="1234 1234 1234 1234"
                    class="bg-muted dark:bg-muted/80 rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div class="grid grid-cols-2 divide-x-2 divide-transparent dark:divide-x">
                    <div>
                      <Input
                        placeholder="MM/YY"
                        class="bg-muted dark:bg-muted/80 rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="CVV"
                        class="bg-muted dark:bg-muted/80 rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <Label class="text-sm font-medium">Name on card</Label>
                <div class="overflow-hidden rounded-md shadow-sm">
                  <Input
                    placeholder="Full name"
                    value="Theo Parker"
                    class="bg-muted dark:bg-muted/80 rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label class="text-sm font-medium">Billing address</Label>
                <div
                  class="divide-y-2 divide-transparent overflow-hidden rounded-md shadow-sm dark:divide-y"
                >
                  <div>
                    <Select.Root
                      type="single"
                      value={country}
                      onValueChange={val => (country = val)}
                    >
                      <Select.Trigger
                        class="bg-muted dark:bg-muted/80 rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      >
                        <span
                        >{country === "uk"
                          ? "United Kingdom"
                          : country === "us"
                          ? "United States"
                          : "Canada"}</span
                        >
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="uk">United Kingdom</Select.Item>
                        <Select.Item value="us">United States</Select.Item>
                        <Select.Item value="ca">Canada</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </div>
                  <div>
                    <Input
                      placeholder="Address line 1"
                      class="bg-muted dark:bg-muted/80 rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
              </div>

              <div class="bg-muted dark:bg-muted/80 space-y-4 rounded-md p-4">
                <div class="flex items-center space-x-2">
                  <Checkbox id="save" bind:checked={saveInfo} />
                  <Label
                    for="save"
                    class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Save my info for fast, secure checkout
                  </Label>
                </div>

                <div class="text-muted-foreground text-xs">
                  By saving my info, I confirm I have read and acknowledged all
                  <a href="/privacy" class="text-brand hover:underline">terms and policies</a>.
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="ecocash" class="mt-6 space-y-6" data-value="ecocash">
              <Alert.Root
                class="rounded-md border border-orange-200/70 bg-gradient-to-r from-orange-50/90 to-orange-50/70 px-4 py-3 dark:border-orange-800/20 dark:from-orange-900/10 dark:to-orange-900/5"
              >
                <Alert.Title class="text-sm font-medium text-orange-800 dark:text-orange-500">
                  EcoCash Payment
                </Alert.Title>
                <Alert.Description class="text-xs text-orange-700 dark:text-orange-400/90">
                  Enter your EcoCash registered phone number below. You will receive a prompt on
                  your phone to complete the payment.
                </Alert.Description>
              </Alert.Root>

              <div class="space-y-2">
                <Label class="text-sm font-medium">Phone Number</Label>
                <div class="overflow-hidden rounded-md shadow-sm">
                  <div class="relative">
                    <div
                      class="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1"
                    >
                      <span class="text-sm">🇿🇼</span>
                      <span class="text-sm">+263</span>
                    </div>
                    <Input
                      placeholder="77XXXXXXX"
                      class="bg-muted dark:bg-muted/80 rounded-none border-none pl-20 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
                <div class="text-muted-foreground text-xs">
                  <Separator class="bg-muted/80 dark:bg-muted/50 mb-4 mt-6" />
                  <p class="text-center">
                    Ensure your phone is turned on and has enough balance. After entering your PIN,
                    your payment will be processed automatically.
                  </p>
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="innbucks" class="mt-6 space-y-6" data-value="innbucks">
              <Alert.Root
                class="rounded-md border border-blue-200/70 bg-gradient-to-r from-blue-50/90 to-blue-50/70 px-4 py-3 dark:border-blue-800/20 dark:from-blue-900/10 dark:to-blue-900/5"
              >
                <Alert.Title class="text-sm font-medium text-blue-800 dark:text-blue-300"
                >Scan QR Code to Pay</Alert.Title
                >
                <Alert.Description class="mt-1 text-xs text-blue-700 dark:text-blue-400/90">
                  Open your InnBucks app and scan the QR code below or dial *569# to complete the
                  payment.
                </Alert.Description>
              </Alert.Root>
              <div
                class="border-muted/80 dark:border-muted/50 flex flex-col items-center space-y-4 rounded-md border p-6"
              >
                <div
                  class="relative flex size-32 items-center justify-center rounded-xl bg-white shadow-sm backdrop-blur-sm dark:bg-slate-900"
                >
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    class="dark:text-white"
                  ><path
                    d="M3 9h6V3H3zm1-5h4v4H4zm1 1h2v2H5zm10 4h6V3h-6zm1-5h4v4h-4zm1 1h2v2h-2zM3 21h6v-6H3zm1-5h4v4H4zm1 1h2v2H5zm15 2h1v2h-2v-3h1zm0-3h1v1h-1zm0-1v1h-1v-1zm-10 2h1v4h-1v-4zm-4-7v2H4v-1H3v-1h3zm4-3h1v1h-1zm3-3v2h-1V3h2v1zm-3 0h1v1h-1zm10 8h1v2h-2v-1h1zm-1-2v1h-2v2h-2v-1h1v-2h3zm-7 4h-1v-1h-1v-1h2v2zm6 2h1v1h-1zm2-5v1h-1v-1zm-9 3v1h-1v-1zm6 5h1v2h-2v-2zm-3 0h1v1h-1v1h-2v-1h1v-1zm0-1v-1h2v1zm0-5h1v3h-1v1h-1v1h-1v-2h-1v-1h3v-1h-1v-1zm-9 0v1H4v-1zm12 4h-1v-1h1zm1-2h-2v-1h2zM8 10h1v1H8v1h1v2H8v-1H7v1H6v-2h1v-2zm3 0V8h3v3h-2v-1h1V9h-1v1zm0-4h1v1h-1zm-1 4h1v1h-1zm3-3V6h1v1z"
                    fill="currentColor"
                  /><path fill="none" d="M0 0h24v24H0z" /></svg
                  >
                </div>

                <div class="text-center">
                  <div class="text-muted-foreground text-xs font-medium">Reference: #123456</div>
                  <Separator class="bg-muted/80 dark:bg-muted/50 mb-4 mt-6" />
                  <div class="text-muted-foreground text-xs leading-relaxed">
                    After scanning the QR code with your InnBucks app, your payment will be
                    processed automatically
                  </div>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Sticky Payment Bar -->
  <footer class="bg-card sticky bottom-0 z-50 backdrop-blur-xl md:rounded-none lg:pb-6">
    <div class="container grid max-w-[500px] gap-3 p-3 pb-4">
      <div class=" flex items-center justify-center gap-2 text-green-600">
        <ShieldCheck class="size-2.5" />
        <Separator orientation="vertical" class="bg-muted min-h-2.5" />
        <span class="text-[0.6rem] font-medium">Secure</span>
      </div>
      <Button
        class="bg-brand hover:bg-brand/85 h-12 w-full gap-2 rounded-full font-bold text-white md:w-auto md:px-28"
        onclick={simulatePayment}
        disabled={isProcessing}
      >
        <span>Pay US $77.18</span>
      </Button>
    </div>
  </footer>
</div>

<!-- Payment Dialog -->
<AlertDialog.Root open={showDialog}>
  <AlertDialog.Content
    class="h-36 w-44 rounded-lg border-none bg-zinc-900/90 backdrop-blur dark:bg-zinc-900/95"
  >
    <div class="grid h-full place-items-center gap-3">
      {#if isProcessing}
        <div class="relative grid size-16 place-items-center rounded-full">
          <span class="absolute inset-0 rounded-full border-[3px] border-green-500/20"></span>
          <span class="absolute inset-0 animate-spin rounded-full border-t-[3px] border-green-500"
          ></span>
          <ShieldCheck class="size-8 text-green-500" />
        </div>
        <p class="text-[0.7rem] font-medium text-white">Payment Processing</p>
      {:else if isSuccess}
        <div class="grid size-16 place-items-center rounded-full bg-green-500/20">
          <CircleCheck class="size-8 text-green-500" />
        </div>
        <p class="text-[0.7rem] font-medium text-white">Payment Successful</p>
      {/if}
    </div>
  </AlertDialog.Content>
</AlertDialog.Root>

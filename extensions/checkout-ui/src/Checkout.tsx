import {
  Banner,
  useApi,
  reactExtension,
  BlockStack,
  useCartLines,
  Checkbox,
  Button,
  Text,
  Spinner
} from '@shopify/ui-extensions-react/checkout';
import { useState } from 'react';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

const BASE_URL = "https://spiritual-holmes-privilege-louisiana.trycloudflare.com";

function Extension() {
  const [checkedProductsIds, setCheckedProductsIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const { checkoutToken } = useApi();

  const cartLines = useCartLines();

  const handleCheckbox = (isChecked: boolean, productId: string) => {
    setCheckedProductsIds(
      (prev) => 
        !isChecked ? 
          prev.filter((_productId) => _productId !== productId) : 
          [...prev, productId]
    );
  }

  const handleSave = async () => {
    if(!checkedProductsIds.length) return;

    setLoading(true);

    const response = await fetch(`${BASE_URL}/api/save_cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        checkoutToken: checkoutToken.current,
        productIds: checkedProductsIds
      })
    });

    response.status !== 200 ? setMessage("Failed to save the cart.") : setMessage("Successfuly saved cart!");;

    setLoading(false);
  }

  return(
    <Banner title="Save your cart">
      <BlockStack inlineAlignment="start">
        <BlockStack>
          {cartLines.map((cartLine) => (
            <Checkbox 
              key={cartLine.id} 
              onChange={(isChecked) => handleCheckbox(isChecked, cartLine.merchandise.product.id)}
            >
              {cartLine.merchandise.title}
            </Checkbox>
          ))}
        </BlockStack>
        <Button onPress={handleSave}>{loading ? <Spinner /> : "Save"}</Button>
        {message && <Text>{message}</Text>}
      </BlockStack>
    </Banner>
  );
}
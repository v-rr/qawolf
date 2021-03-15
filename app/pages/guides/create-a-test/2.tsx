import { Box } from "grommet";
import { BsArrowLeft } from "react-icons/bs";

import { patchHandle } from "../../../components/Editor/Canvas/CodeToggle";
import { getUserId } from "../../../components/Guides/CreateATest/helpers";
import {
  iconProps,
  textProps,
} from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import NextButton from "../../../components/Guides/CreateATest/NextButton";
import WolfButton from "../../../components/shared/icons/WolfButton";
import Text from "../../../components/shared/Text";
import { useWolf } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";

const wolfHeight = "152px";
const step = 2;

export default function CreateATest2(): JSX.Element {
  const userId = getUserId();

  const { data } = useWolf({ user_id: userId });
  const wolf = data?.wolf || null;

  return (
    <Layout step={step}>
      <Box>
        {!!wolf && <Text {...textProps}>{copy.runTestIntro(wolf.name)}</Text>}
        <Text {...textProps}>
          {copy.runTestIntro2} <code>{patchHandle}</code>
        </Text>
      </Box>
      <BsArrowLeft {...iconProps} />
      <Text {...textProps} margin={{ vertical: "medium" }}>
        {copy.runTestIntro3} <code>⌘</code> / <code>Ctrl</code> +{" "}
        <code>Enter</code>.
      </Text>
      <Box alignSelf="center" height={wolfHeight}>
        {!!wolf && <WolfButton color={wolf.variant} />}
      </Box>
      <NextButton step={step} />
    </Layout>
  );
}
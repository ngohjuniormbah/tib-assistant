import {
  Alert,
  Button,
  Checkbox,
  Form,
  Link as UiLink,
  Modal,
  Spinner,
  Tooltip,
  useOverlayState,
} from '@heroui/react';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';

import ROUTES from '@/constants/routes';
import useAuth from '@/lib/useAuth';
import useUserConsent from '@/lib/useUserConsent';
import { updateUserConsent } from '@/pocketbase/userConsent';
import { UserConsentNameOptions } from '@/types/pocketbase-types';

export default function ConsentModal() {
  const overlayState = useOverlayState();
  const [isSelectedOpenAi, setIsSelectedOpenAi] = useState(false);
  const [isSelectedTermsOfUse, setIsSelectedTermsOfUse] = useState(false);
  const [isSelectedGravatar, setIsSelectedGravatar] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const { isAuthenticated } = useAuth();
  const { mutateUserConsent, isConsentGiven } = useUserConsent();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSelectedOpenAi(!!isConsentGiven(UserConsentNameOptions.openAi));
    setIsSelectedTermsOfUse(
      !!isConsentGiven(UserConsentNameOptions.termsOfUse)
    );
    setIsSelectedGravatar(!!isConsentGiven(UserConsentNameOptions.gravatar));
  }, [isConsentGiven]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      await updateUserConsent({
        consentItems: [
          {
            name: UserConsentNameOptions.openAi,
            hasAccepted: isSelectedOpenAi,
          },
          {
            name: UserConsentNameOptions.termsOfUse,
            hasAccepted: isSelectedTermsOfUse,
          },
          {
            name: UserConsentNameOptions.gravatar,
            hasAccepted: isSelectedGravatar,
          },
        ],
      });
      mutateUserConsent();
      overlayState.close();
    });
  };

  const isClosable =
    isConsentGiven(UserConsentNameOptions.openAi) &&
    isConsentGiven(UserConsentNameOptions.termsOfUse);

  if (!isAuthenticated) {
    return (
      <Tooltip delay={0}>
        <Tooltip.Trigger>
          <UiLink className="text-base text-inherit">Consent settings</UiLink>
        </Tooltip.Trigger>
        <Tooltip.Content>
          You need to be logged in to change consent settings
        </Tooltip.Content>
      </Tooltip>
    );
  }

  return (
    <>
      <UiLink className="text-base text-inherit" onPress={overlayState.toggle}>
        Consent settings
      </UiLink>
      <Modal.Backdrop
        isOpen={isClosable ? overlayState.isOpen : true}
        onOpenChange={isClosable ? overlayState.setOpen : undefined}
        isDismissable={isClosable}
      >
        <Modal.Container placement="top">
          <Modal.Dialog className="max-w-xl">
            {isClosable && <Modal.CloseTrigger />}
            <Modal.Header>
              <Modal.Heading>
                <div className="flex items-center">Consent settings</div>
              </Modal.Heading>
            </Modal.Header>
            <Form className="max-w-full" onSubmit={handleSubmit}>
              <Modal.Body className="w-full">
                <Alert>
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>
                      <p>
                        For the TIB AIssistant to function, we need your consent
                        for each external service. These services are processing
                        data provided by you, and could use cookies in the
                        process. Be aware that optional services can be
                        disabled, but it limits the functionalities of the
                        AIssistant.{' '}
                      </p>

                      <p className="mt-3 font-bold">
                        By enabling any of the services, you confirm that no
                        personal data is included, whether your own or personal
                        data of other individuals, into the system.
                      </p>
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
                <div className="mt-4 font-bold">Required</div>
                <div className="flex flex-col mb-3">
                  <Checkbox
                    isSelected={isSelectedOpenAi}
                    onChange={setIsSelectedOpenAi}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <div className="font-bold">OpenAI</div>
                    </Checkbox.Content>
                  </Checkbox>

                  <p className="ms-7">
                    Prompts entered in any of the assistants are forwarded in
                    unchanged form to ChatGPT operated by OpenAI as described in
                    the{' '}
                    <a href={ROUTES.INFO_SHEET_DATA_PROTECTION} target="_blank">
                      information sheet on TIB AIssistant
                    </a>
                    . I agree to the processing of my personal data by OpenAI,
                    located in the USA and by TIB in the TIB AIssistant as
                    described in the{' '}
                    <Link href={ROUTES.DATA_PROTECTION} target="_blank">
                      data privacy notice
                    </Link>{' '}
                    and the{' '}
                    <a href={ROUTES.INFO_SHEET_DATA_PROTECTION} target="_blank">
                      information sheet on TIB AIssistant
                    </a>
                    .
                  </p>
                </div>
                <div className="flex flex-col mb-3">
                  <Checkbox
                    isSelected={isSelectedTermsOfUse}
                    onChange={setIsSelectedTermsOfUse}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <div className="font-bold">TIB AIssistant</div>
                    </Checkbox.Content>
                  </Checkbox>
                  <p className="ms-7">
                    I agree to the{' '}
                    <Link
                      href={ROUTES.TERMS_OF_USE}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                    >
                      terms and conditions
                    </Link>{' '}
                    of the service.
                  </p>
                </div>
                <div className="mt-4 font-bold">Optional</div>
                <div className="flex flex-col mb-3">
                  <Checkbox
                    isSelected={isSelectedGravatar}
                    onChange={setIsSelectedGravatar}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <div className="font-bold">Gravatar</div>
                    </Checkbox.Content>
                  </Checkbox>
                  <p className="ms-7">
                    I agree to the processing of my data provided here by
                    Gravatar
                  </p>
                </div>
              </Modal.Body>
              <Modal.Footer className="flex w-full justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={!isSelectedOpenAi || !isSelectedTermsOfUse}
                  isPending={isLoading}
                >
                  {({ isPending }) => (
                    <>
                      {isPending && <Spinner size="sm" color="current" />}
                      Save
                    </>
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}

'use client';

import {
  faBookOpen,
  faFingerprint,
  faLightbulb,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Description,
  Input,
  Label,
  Modal,
  Tabs,
} from '@heroui/react';
import { FormEvent, useState } from 'react';

export type IdeationStarterModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectStarter: (prompt: string) => void;
};

export default function IdeationStarterModal({
  isOpen,
  onOpenChange,
  onSelectStarter,
}: IdeationStarterModalProps) {
  const [selectedTab, setSelectedTab] = useState<string>('doi');
  const [doi, setDoi] = useState('');
  const [orcid, setOrcid] = useState('');
  const [topic, setTopic] = useState('');

  const handleDoiSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!doi.trim()) return;
    onSelectStarter(
      `Please look up seed paper DOI: ${doi.trim()} using Crossref and Semantic Scholar. Retrieve its title, abstract, and core contributions. Analyze the limitations and open challenges noted in this work, and formulate 3 novel, testable research positions addressing these gaps.`
    );
  };

  const handleOrcidSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orcid.trim()) return;
    onSelectStarter(
      `Please retrieve my publication record using ORCID: ${orcid.trim()} with the ORCID tool. Based on my research trajectory, methods, and recurring themes, identify unexplored intersections and propose 3 high-impact future research avenues.`
    );
  };

  const handleTopicSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSelectStarter(
      `Search recent scientific literature on "${topic.trim()}" using Semantic Scholar. Identify 3 critical research gaps or conflicting paradigms in current work, and formulate concrete hypotheses and methodologies to address them.`
    );
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLightbulb} className="text-muted" />
                <span>Research Ideation Starters</span>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body className="space-y-4">
            <p className="text-sm text-muted">
              Choose a kickstart method below to ground your research ideation in verifiable scholarly sources:
            </p>

            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              className="gap-0!"
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Ideation Starter Modes" className="w-full">
                  <Tabs.Tab id="doi" className="gap-2">
                    <FontAwesomeIcon icon={faBookOpen} />
                    <span>Seed DOI</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="orcid" className="gap-2">
                    <FontAwesomeIcon icon={faFingerprint} />
                    <span>ORCID Profile</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="topic" className="gap-2">
                    <FontAwesomeIcon icon={faSearch} />
                    <span>Topic Search</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              <Tabs.Panel id="doi" className="pt-4">
                <form onSubmit={handleDoiSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="starter-doi">Foundational Paper DOI or URL</Label>
                    <Input
                      id="starter-doi"
                      placeholder="e.g. 10.1038/s41586-020-2649-2"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      required
                    />
                    <Description>
                      Fetches paper metadata to discover unexplored limitations and open questions.
                    </Description>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" isDisabled={!doi.trim()}>
                      Generate Ideas from Paper
                    </Button>
                  </div>
                </form>
              </Tabs.Panel>

              <Tabs.Panel id="orcid" className="pt-4">
                <form onSubmit={handleOrcidSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="starter-orcid">ORCID Identifier</Label>
                    <Input
                      id="starter-orcid"
                      placeholder="e.g. 0000-0002-1825-0097"
                      value={orcid}
                      onChange={(e) => setOrcid(e.target.value)}
                      required
                    />
                    <Description>
                      Retrieves your published works to suggest natural next frontiers for your research career.
                    </Description>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" isDisabled={!orcid.trim()}>
                      Analyze My Research Trajectory
                    </Button>
                  </div>
                </form>
              </Tabs.Panel>

              <Tabs.Panel id="topic" className="pt-4">
                <form onSubmit={handleTopicSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="starter-topic">Field or Research Area</Label>
                    <Input
                      id="starter-topic"
                      placeholder="e.g. Knowledge Graphs in Medical Question Answering"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                    <Description>
                      Probes Semantic Scholar for recent benchmark papers and open literature debates.
                    </Description>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" isDisabled={!topic.trim()}>
                      Discover Topic Gaps
                    </Button>
                  </div>
                </form>
              </Tabs.Panel>
            </Tabs>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

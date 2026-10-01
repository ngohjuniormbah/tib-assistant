'use client';

import {
  faArrowUpRightFromSquare,
  faBookOpen,
  faFingerprint,
  faLightbulb,
  faMagnifyingGlass,
  faPaperPlane,
  faPlus,
  faSearch,
  faShieldHalved,
  faTable,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Button,
  Chip,
  Description,
  Input,
  Label,
  Modal,
  Spinner,
  Tabs,
  TextArea,
  TextField,
} from '@heroui/react';
import { FormEvent, useState } from 'react';

import {
  getOrkgProblemGraph,
  OrkgProblem,
  searchDirectOrkgProblems,
} from '@/services/orkgClient';
import {
  checkPriorArtCollision,
  PriorArtCollisionCheck,
} from '@/services/orkgDiscovery';

export type IdeationStarterModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectStarter: (prompt: string, autoSend?: boolean) => void;
};

const SUGGESTED_ORKG_PROBLEMS = [
  'Question Answering over Knowledge Graphs',
  'Zero-shot Scientific Entity Linking',
  'Biomedical Relation Extraction',
  'Open-Domain Question Answering',
];

export default function IdeationStarterModal({
  isOpen,
  onOpenChange,
  onSelectStarter,
}: IdeationStarterModalProps) {
  const [selectedTab, setSelectedTab] = useState<string>('orkg');
  const [doi, setDoi] = useState('');
  const [orcid, setOrcid] = useState('');
  const [topic, setTopic] = useState('');

  // ORKG Graph Search state
  const [orkgProblemQuery, setOrkgProblemQuery] = useState('');
  const [isSearchingOrkg, setIsSearchingOrkg] = useState(false);
  const [hasSearchedOrkg, setHasSearchedOrkg] = useState(false);
  const [orkgProblems, setOrkgProblems] = useState<OrkgProblem[]>([]);
  const [loadingProblemId, setLoadingProblemId] = useState<string | null>(null);

  // Prior-Art Collision Audit state
  const [auditHypothesis, setAuditHypothesis] = useState('');
  const [auditKeywords, setAuditKeywords] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<PriorArtCollisionCheck | null>(
    null
  );

  const executeOrkgSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsSearchingOrkg(true);
    setHasSearchedOrkg(true);
    setOrkgProblems([]);

    try {
      const results = await searchDirectOrkgProblems(term.trim());
      setOrkgProblems(results);
    } catch (err) {
      console.error('ORKG search error:', err);
    } finally {
      setIsSearchingOrkg(false);
    }
  };

  const handleSearchOrkgProblems = (e: FormEvent) => {
    e.preventDefault();
    executeOrkgSearch(orkgProblemQuery);
  };

  /**
   * Prepares the full ORKG problem graph context and either auto-sends or places into input bar
   */
  const handleSelectProblem = async (
    problem: OrkgProblem,
    autoSend: boolean
  ) => {
    setLoadingProblemId(problem.id);

    let compContext = 'Problem benchmarks extracted from ORKG.';
    let metricsContext = '';
    let datasetContext = '';

    try {
      const graph = await getOrkgProblemGraph(problem.id);
      if (graph && graph.comparisons.length > 0) {
        compContext = `Existing ORKG Comparisons: ${graph.comparisons
          .map((c) => c.title)
          .slice(0, 3)
          .join('; ')}.`;
      }
      if (graph && graph.metrics.length > 0) {
        metricsContext = `Observed ORKG Evaluation Metrics: ${graph.metrics.join(', ')}.`;
      }
      if (graph && graph.datasets.length > 0) {
        datasetContext = `ORKG Benchmark Datasets: ${graph.datasets.join(', ')}.`;
      }
    } catch (err) {
      console.warn('Graph mining error:', err);
    } finally {
      setLoadingProblemId(null);
    }

    const promptText = `Analyze the research problem "${problem.label}" (ORKG ID: ${problem.id}) directly from the Open Research Knowledge Graph.\n- ${compContext}\n${
      metricsContext ? `- ${metricsContext}\n` : ''
    }${
      datasetContext ? `- ${datasetContext}\n` : ''
    }Formulate 3 publication-grade, falsifiable research hypotheses addressing the current benchmark plateaus in this problem. Present each as a selectable checkbox with Heilmeier criteria.`;

    onSelectStarter(promptText, autoSend);
  };

  const handleDoiSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!doi.trim()) return;
    onSelectStarter(
      `Please analyze foundational paper DOI: ${doi.trim()} using Crossref and Semantic Scholar. Extract its core contribution, documented limitations, and unexplored boundary conditions. Formulate 3 publication-grade, falsifiable research hypotheses addressing these exact gaps.`,
      true
    );
  };

  const handleOrcidSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orcid.trim()) return;
    onSelectStarter(
      `Please inspect my scholarly trajectory using ORCID: ${orcid.trim()} with the ORCID tool. Identify unexplored intersections across my publications, detect emerging methodological gaps, and propose 3 high-impact future research avenues.`,
      true
    );
  };

  const handleTopicSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSelectStarter(
      `Investigate the scientific frontier of "${topic.trim()}" across Semantic Scholar and ORKG. Identify 3 critical unsolved knowledge gaps, and formulate concrete hypotheses, baseline comparisons, and benchmark evaluation protocols.`,
      true
    );
  };

  const handleRunCollisionAudit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auditHypothesis.trim()) return;
    setIsAuditing(true);
    setAuditResult(null);

    try {
      const keywords = auditKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      const result = await checkPriorArtCollision(auditHypothesis, keywords);
      setAuditResult(result);
    } catch (err) {
      console.error('Audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAdoptAuditToChat = (autoSend: boolean) => {
    if (!auditResult) return;
    const collisionList = auditResult.potentialCollisions
      .map((c) => `- "${c.title}" (${c.similarityHint})`)
      .join('\n');

    onSelectStarter(
      `I want to formulate publication-grade directions for this hypothesis: "${auditHypothesis}". Prior-art collision audit scored novelty at ${auditResult.noveltyScore}% (${auditResult.verdict.replace(
        '_',
        ' '
      )}). Potentially overlapping literature:\n${
        collisionList || 'None detected.'
      }\n\nPlease perform an adversarial critique (Reviewer 2 stress-test) and formulate 3 publication-ready, falsifiable directions addressing these points.`,
      autoSend
    );
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-3xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLightbulb} className="text-muted" />
                <span>Research Ideation Studio</span>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              Ground hypothesis formulation in peer-reviewed literature, ORKG
              benchmark graphs, or run real-time prior-art collision audits:
            </p>

            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              className="gap-0!"
            >
              <Tabs.ListContainer>
                <Tabs.List
                  aria-label="Ideation Studio Modes"
                  className="w-full flex-wrap"
                >
                  <Tabs.Tab id="orkg" className="gap-2">
                    <FontAwesomeIcon icon={faTable} />
                    <span>ORKG Benchmark Graph</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="collision" className="gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span>Prior-Art Collision Audit</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="doi" className="gap-2">
                    <FontAwesomeIcon icon={faBookOpen} />
                    <span>Seed DOI</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="topic" className="gap-2">
                    <FontAwesomeIcon icon={faSearch} />
                    <span>Topic Frontier</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="orcid" className="gap-2">
                    <FontAwesomeIcon icon={faFingerprint} />
                    <span>ORCID Profile</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              {/* Tab 1: ORKG Graph Mining Tab */}
              <Tabs.Panel id="orkg" className="pt-4 space-y-4">
                <form
                  onSubmit={handleSearchOrkgProblems}
                  className="flex gap-2 items-end"
                >
                  <TextField className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-foreground">
                      Search Research Problem or Benchmark in ORKG
                    </Label>
                    <Input
                      placeholder="e.g. Question Answering, Entity Linking"
                      value={orkgProblemQuery}
                      onChange={(e) => setOrkgProblemQuery(e.target.value)}
                      required
                    />
                  </TextField>
                  <Button
                    type="submit"
                    variant="primary"
                    isDisabled={isSearchingOrkg || !orkgProblemQuery.trim()}
                  >
                    {isSearchingOrkg ? (
                      <Spinner size="sm" color="current" />
                    ) : (
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    )}
                    <span>Search ORKG</span>
                  </Button>
                </form>

                {/* Instant Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-xs text-muted font-medium">
                    Quick Suggestions:
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {SUGGESTED_ORKG_PROBLEMS.map((suggestion) => (
                      <Button
                        key={suggestion}
                        size="sm"
                        variant="secondary"
                        className="text-xs py-0.5 px-2.5 h-6"
                        onPress={() => {
                          setOrkgProblemQuery(suggestion);
                          executeOrkgSearch(suggestion);
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {hasSearchedOrkg &&
                  !isSearchingOrkg &&
                  orkgProblems.length === 0 && (
                    <Alert>
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Description>
                          No specific problem resource matched &quot;
                          {orkgProblemQuery}&quot;. Try one of the quick
                          suggestions above or use the{' '}
                          <strong>Topic Frontier</strong> tab.
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}

                {orkgProblems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted">
                        Select an ORKG Problem Graph ({orkgProblems.length}{' '}
                        found):
                      </span>
                      <span className="text-[11px] text-muted italic">
                        Tip: Click <strong>+ Add to Prompt</strong> to add your
                        own instructions, or <strong>plane</strong> to generate
                        immediately.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {orkgProblems.map((problem) => (
                        <div
                          key={problem.id}
                          className="p-3 rounded-xl border border-border bg-surface-secondary/40 hover:bg-surface-secondary transition flex items-center justify-between gap-2"
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <span
                              className="font-semibold text-sm truncate text-foreground"
                              title={problem.label}
                            >
                              {problem.label}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Chip size="sm">ORKG GRAPH</Chip>
                              <a
                                href={`https://orkg.org/resource/${problem.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-link hover:underline inline-flex items-center gap-1 font-mono"
                                title="Open this resource on orkg.org"
                              >
                                <span>{problem.id}</span>
                                <FontAwesomeIcon
                                  icon={faArrowUpRightFromSquare}
                                  className="text-[9px]"
                                />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Option A: Inject into prompt bar to allow typing custom prompt */}
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs px-2 h-7 gap-1"
                              title="Add to input bar and type your own instructions"
                              isPending={loadingProblemId === problem.id}
                              onPress={() =>
                                handleSelectProblem(problem, false)
                              }
                            >
                              <FontAwesomeIcon
                                icon={faPlus}
                                className="text-[10px]"
                              />
                              <span className="hidden sm:inline">
                                Add to Prompt
                              </span>
                            </Button>

                            {/* Option B: Generate instantly */}
                            <Button
                              size="sm"
                              variant="primary"
                              className="h-7 w-7 p-0 min-w-7"
                              title="Generate ideas immediately"
                              isPending={loadingProblemId === problem.id}
                              onPress={() => handleSelectProblem(problem, true)}
                            >
                              <FontAwesomeIcon
                                icon={faPaperPlane}
                                className="text-xs"
                              />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Tabs.Panel>

              {/* Tab 2: Prior-Art Collision Audit Tab */}
              <Tabs.Panel id="collision" className="pt-4 space-y-4">
                <form
                  onSubmit={handleRunCollisionAudit}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-foreground">
                      Candidate Hypothesis to Audit
                    </Label>
                    <TextArea
                      rows={2}
                      placeholder="e.g. Using diffusion probabilistic decoders with knowledge graph embeddings for relation extraction."
                      value={auditHypothesis}
                      onChange={(e) => setAuditHypothesis(e.target.value)}
                      required
                    />
                    <Description className="text-xs text-muted">
                      Audits literature across Semantic Scholar and ORKG to
                      detect prior art collisions.
                    </Description>
                  </div>

                  <TextField className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold text-foreground">
                      Key Domain Keywords (Comma Separated)
                    </Label>
                    <Input
                      placeholder="e.g. diffusion, knowledge graph, relation extraction"
                      value={auditKeywords}
                      onChange={(e) => setAuditKeywords(e.target.value)}
                    />
                  </TextField>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={isAuditing || !auditHypothesis.trim()}
                    >
                      {isAuditing ? (
                        <Spinner size="sm" color="current" />
                      ) : (
                        <FontAwesomeIcon icon={faShieldHalved} />
                      )}
                      <span>Audit Prior-Art Collision</span>
                    </Button>
                  </div>
                </form>

                {auditResult && (
                  <div className="p-4 rounded-xl border border-border bg-surface-secondary/40 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          Novelty Score:
                        </span>
                        <Chip size="sm">{auditResult.noveltyScore}%</Chip>
                        <Chip size="sm">
                          {auditResult.verdict.replace('_', ' ').toUpperCase()}
                        </Chip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onPress={() => handleAdoptAuditToChat(false)}
                          className="text-xs"
                          title="Put into prompt box to add custom prompt"
                        >
                          + Add to Prompt
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onPress={() => handleAdoptAuditToChat(true)}
                          className="gap-1.5 text-xs"
                        >
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="text-xs"
                          />
                          <span>Generate Now</span>
                        </Button>
                      </div>
                    </div>

                    {auditResult.potentialCollisions.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs font-semibold text-muted">
                          Closely Related Prior Art Detected:
                        </span>
                        <ul className="text-xs space-y-1.5 list-disc list-inside text-muted">
                          {auditResult.potentialCollisions.map((col, idx) => (
                            <li key={idx}>
                              <span className="font-medium text-foreground">
                                {col.title}
                              </span>
                              <span className="ml-1 text-muted">
                                ({col.similarityHint})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <Alert>
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Description>
                            High novelty clearance: No direct conceptual
                            collisions found in recent top venues.
                          </Alert.Description>
                        </Alert.Content>
                      </Alert>
                    )}
                  </div>
                )}
              </Tabs.Panel>

              {/* Tab 3: Seed DOI Tab */}
              <Tabs.Panel id="doi" className="pt-4">
                <form
                  onSubmit={handleDoiSubmit}
                  className="flex flex-col gap-4"
                >
                  <TextField className="w-full flex flex-col gap-2">
                    <Label className="text-sm font-medium text-foreground">
                      Foundational Paper DOI or URL
                    </Label>
                    <Input
                      placeholder="e.g. 10.1038/s41586-020-2649-2"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      required
                    />
                    <Description className="text-xs text-muted">
                      Extracts paper methodology and open challenges to
                      formulate new directions.
                    </Description>
                  </TextField>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={!doi.trim()}
                    >
                      Generate Ideas from Paper
                    </Button>
                  </div>
                </form>
              </Tabs.Panel>

              {/* Tab 4: Topic Search Tab */}
              <Tabs.Panel id="topic" className="pt-4">
                <form
                  onSubmit={handleTopicSubmit}
                  className="flex flex-col gap-4"
                >
                  <TextField className="w-full flex flex-col gap-2">
                    <Label className="text-sm font-medium text-foreground">
                      Research Field or Frontier Keyword
                    </Label>
                    <Input
                      placeholder="e.g. Neuro-symbolic reasoning in medical diagnostics"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                    <Description className="text-xs text-muted">
                      Probes Semantic Scholar and top venues for recent
                      unresolved gaps.
                    </Description>
                  </TextField>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={!topic.trim()}
                    >
                      Discover Topic Gaps
                    </Button>
                  </div>
                </form>
              </Tabs.Panel>

              {/* Tab 5: ORCID Profile Tab */}
              <Tabs.Panel id="orcid" className="pt-4">
                <form
                  onSubmit={handleOrcidSubmit}
                  className="flex flex-col gap-4"
                >
                  <TextField className="w-full flex flex-col gap-2">
                    <Label className="text-sm font-medium text-foreground">
                      ORCID Researcher Identifier
                    </Label>
                    <Input
                      placeholder="e.g. 0000-0002-1825-0097"
                      value={orcid}
                      onChange={(e) => setOrcid(e.target.value)}
                      required
                    />
                    <Description className="text-xs text-muted">
                      Analyzes your past publications to identify natural next
                      research frontiers.
                    </Description>
                  </TextField>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={!orcid.trim()}
                    >
                      Analyze Research Trajectory
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

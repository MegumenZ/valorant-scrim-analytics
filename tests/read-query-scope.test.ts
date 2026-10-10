import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getMatchById: vi.fn(),
  getAllMatches: vi.fn(),
  detailView: vi.fn(() => null),
}));

vi.mock("@/lib/actions/matches", () => ({ getMatchById: mocks.getMatchById, getAllMatches: mocks.getAllMatches }));
vi.mock("@/components/matches/match-detail-view", () => ({ MatchDetailView: mocks.detailView }));
vi.mock("next/navigation", () => ({ notFound: vi.fn(() => { throw new Error("not found"); }) }));

import MatchDetailPage from "@/app/matches/[id]/page";

describe("bounded match reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMatchById.mockResolvedValue({ id: "m1" });
  });

  it("loads only the requested match on the detail page", async () => {
    await MatchDetailPage({ params: Promise.resolve({ id: "m1" }) });
    expect(mocks.getMatchById).toHaveBeenCalledWith("m1");
    expect(mocks.getAllMatches).not.toHaveBeenCalled();
  });
});

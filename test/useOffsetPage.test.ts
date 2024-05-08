import { RenderHookResult, renderHook, waitFor } from "@testing-library/react";
import useOffsetPage, { OffestPageCondition, OffsetResult, Options, UseOffsetPageResult } from "../src/hooks/useOffsetPage";
import { act } from "react-dom/test-utils";


describe("useOffsetPage", () => {
    const setUp = (service: (page: OffestPageCondition) => Promise<OffsetResult<string>>, params: Record<string, any>, options: Options) => renderHook(() => useOffsetPage<string>(service, params, options));

    let hook: RenderHookResult<UseOffsetPageResult<string>, {}>
    it("useOffsetPage auto begin", async () => {
        act(() => {
            hook = setUp((page) => testService(page), {}, {
            })

        })
        await waitFor(() => {
            expect(hook.result.current.records.length).toBe(3);
            expect(hook.result.current.hasMore).toBe(true);
            expect(hook.result.current.offset).toBe(3);
        })

        await act(async () => {
            await hook.result.current.getMore()
        })
        // expect(hook.result.current.loading).toBe(false);
        // expect(hook.result.current.records.length).toBe(1)

        await waitFor(() => {
            expect(hook.result.current.records.length).toBe(4);
            expect(hook.result.current.hasMore).toBe(false);
        })
    })
})



const testService = (page: OffestPageCondition) => {
    console.log("page", page)
    if (page.offset.toString() === "0") {
        return Promise.resolve({
            records: ["1", "2", "3"],
            hasMore: true,
            offset: 3
        })
    } else {
        return Promise.resolve({
            records: ["4"],
            hasMore: false,
            offset: 4
        })
    }
}

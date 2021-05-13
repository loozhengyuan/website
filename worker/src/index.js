import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener("fetch", (event) => {
    try {
        event.respondWith(handleEvent(event))
    } catch (e) {
        event.respondWith(new Response('Internal Error', { status: 500 }))
    }
})

async function handleEvent(event) {
    try {
        let options = {}
        let response = await getAssetFromKV(event, options)
        return response
    } catch (e) {
        let response = await getAssetFromKV(event, {
            mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/404.html`, req),
        })
        return new Response(response.body, { ...response, status: 404 })
    }
}

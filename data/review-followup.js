/* 今日はC&Aの何の日？｜実施確認の管理台帳（公演データとは独立）
 * ここに記録するのは調査・確認作業の終了区分であり、開催実績の確定ではない。
 * 公演ID、元の登録状態、出典、備考、データバージョンは変更しない。
 * 次回の点検で裏付けが見つかった場合は、公演データの状態と本台帳を別々に見直す。
 */
window.CA_REVIEW_FOLLOWUP = Object.freeze({
  schemaVersion: 1,
  lastReviewed: '2026-11-20',
  entries: Object.freeze({
    'v16-0135': Object.freeze({
      disposition: 'closed_unverified',
      reviewedAt: '2026-11-20',
      reason: 'オンラインファンミーティングは開催後の公式実施報告が通常発表されないため、開催告知の確認をもって定例の追跡を終了する。実施の確定は行わない。'
    }),
    'v16-0136': Object.freeze({
      disposition: 'closed_unverified',
      reviewedAt: '2026-11-20',
      reason: 'オンラインファンミーティングは開催後の公式実施報告が通常発表されないため、開催告知の確認をもって定例の追跡を終了する。実施の確定は行わない。'
    })
  })
});

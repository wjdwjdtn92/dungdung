// 루트 / 경로에서 직접 지도를 렌더링 (redirect 없이)
// redirect('/map')은 무한 307 루프를 일으킬 수 있어 re-export 방식 사용
export { default } from './map/page';

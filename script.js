import { init, renderer, animateId, animateCameraId } from "./set_model.js";

$(document).ready(() => {
  const $menu = $("#playlistMenu");
  const $mainWrapper = $("#mainWrapper");
  const $overlay = $("#loading-overlay");
  const $darkToggle = $("#darkToggleFloating");
  const $volumeToggle = $("#volumeToggle");
  const $volumeFloating = $("#volumeFloating");
  const $audioPlayer = $("#audioPlayer")[0];
  const $volumeControl = $("#volumeControl");
  const $volumeValue = $("#volumeValue");
  const $cards = $(".card");
  const $threeContainer = $("#threeContainer");
  const $exit3D = $("#exit3D");
  const $stopMusicButtonInVolume = $("#stopMusicButtonInVolume");
  const $allDetails = $("#playlistMenu details");

  let campfireAudio = null;

  // 메뉴 열기
  $("#menuToggle").on("click", () => {
    $menu.addClass("open");
    $mainWrapper.addClass("shifted");
  });

  // 메뉴 닫기
  $("#closeMenu").on("click", () => {
    $menu.removeClass("open");
    $mainWrapper.removeClass("shifted");
    $allDetails.prop("open", false);
  });

  // 다크모드 토글
  $darkToggle.on("click", () => {
    $("body").toggleClass("dark-mode");
    $darkToggle.text($("body").hasClass("dark-mode") ? "☀️" : "🌙");
  });

  // 볼륨 토글
  $volumeToggle.on("click", () => {
    $volumeFloating.toggle();
  });

  // 음악 정지 버튼
  $stopMusicButtonInVolume.on("click", () => {
    $audioPlayer.pause();
    $audioPlayer.currentTime = 0;
    stopAllSounds();
  });

  // 볼륨 변경
  $volumeControl.on("input", () => {
    const volume = $volumeControl.val();
    $audioPlayer.volume = volume;
    if (campfireAudio) campfireAudio.volume = volume;
    $volumeValue.text(`${Math.round(volume * 100)}%`);
  });

  // details 하나만 열리게
  $allDetails.on("toggle", function () {
    if (this.open) {
      $allDetails.not(this).prop("open", false);
    }
  });

  // 카드 클릭
  $cards.on("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const cardText = $(this).find(".card-front").text().trim();
    let glbPath = "";

    $audioPlayer.pause();
    $audioPlayer.currentTime = 0;
    stopAllSounds();

    switch (cardText) {
      case "🔥 모닥불 감성":
        glbPath =
          "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/models/campfire.glb";
        playCampfireSound();
        break;
      case "🌧️ 비 오는 날":
        glbPath =
          "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/models/rainy.glb";
        playRainSound();
        break;
      case "🌙 밤 감성":
        glbPath =
          "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/models/night.glb";
        playNightSound();
        break;
      case "🌌 몽환적인 분위기":
        glbPath =
          "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/models/dreamy.glb";
        playDreamySound();
        break;
      default:
        glbPath = "environment/models/default.glb";
    }

    $cards.css("pointer-events", "none");
    $overlay.show();
    init(glbPath, cardText);
  });

  // 3D 종료 버튼
  $exit3D.on("click", () => {
    $overlay.hide().css("opacity", 1);
    $("body").css("overflow", "auto");
    cancelAnimationFrame(animateId);
    cancelAnimationFrame(animateCameraId);
    $threeContainer.hide();
    $exit3D.hide();
    renderer.dispose();
    renderer.forceContextLoss();
    $threeContainer.html("");
    stopAllSounds();
    $cards.css("pointer-events", "auto");
  });

  // 외부 클릭으로 볼륨창 닫기
  $(document).on("click", (e) => {
    if (
      !$volumeFloating[0].contains(e.target) &&
      !$volumeToggle[0].contains(e.target)
    ) {
      $volumeFloating.hide();
    }
  });

  // 전역 함수 등록
  window.playMusic = function (filename) {
    stopAllSounds();
    $audioPlayer.src = filename;
    $audioPlayer.volume = $volumeControl.val();
    $audioPlayer.play();
  };

  // 배경음 재생 함수들
  function playSound(path) {
    stopAllSounds();
    campfireAudio = new Audio(path);
    campfireAudio.loop = true;
    campfireAudio.volume = $volumeControl.val();
    campfireAudio.play();
  }

  function playCampfireSound() {
    playSound(
      "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/music/card/fire.mp3"
    );
  }

  function playRainSound() {
    playSound(
      "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/music/card/rain.mp3"
    );
  }

  function playNightSound() {
    playSound(
      "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/music/card/night.mp3"
    );
  }

  function playDreamySound() {
    playSound(
      "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/music/card/dreamy.mp3"
    );
  }

  function stopAllSounds() {
    if (campfireAudio) {
      campfireAudio.pause();
      campfireAudio.currentTime = 0;
      campfireAudio = null;
    }
  }
});

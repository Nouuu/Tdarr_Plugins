/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
  id: 'Tdarr_Plugin_BEST_Nospy_FFMPEG_CPU_H265_ULTIMATE',
  Stage: 'Pre-processing',
  Name: 'Nospy-Transcode H265 Using CPU & FFMPEG, Ultimate Settings',
  Type: 'Video',
  Operation: 'Transcode',
  Description: `Files not in H265 will be transcode into H265 using CPU with ffmpeg.
                Settings are dependant on file bitrate
                Working by the logic that H265 can support the same amount of data at half the bitrate of H264.
                This plugin will adapt bitrate settings based on original bitrate and resolution.
                This plugin will skip any files that are in the VP9 codec.`,
  Version: '0.1',
  Tags: 'pre-processing,ffmpeg,video only,configurable,h265',
  Inputs: [
    {
      name: 'anime',
      type: 'boolean',
      defaultValue: false,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Specify if file is anime.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    },
    {
      name: 'container',
      type: 'string',
      defaultValue: 'mkv',
      inputUI: {
        type: 'dropdown',
        options: [
          'mkv',
          'mp4',
          'original',
        ],
      },
      tooltip: `Specify output container of file. Use 'original' without quotes to keep original container.
                  \\n Ensure that all stream types you may have are supported by your chosen container.
                  \\n mkv is recommended.`
      ,
    },
    {
      name: 'handle_hd',
      type: 'boolean',
      defaultValue: true,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Specify if HD content should be handled.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    },
    {
      name: 'hd_bitrate_cutoff',
      type: 'number',
      defaultValue: 1800,
      inputUI: {
        type: 'text',
      },
      tooltip: `Specify the bitrate cutoff for HD content.
                    \\nExample:\\n
                    1800
                    
                    \\nExample:\\n
                    2500`,
    },
    {
      name: 'handle_fhd',
      type: 'boolean',
      defaultValue: true,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Specify if FHD content should be handled.
                    \\nExample:\\n
                    true
                    
                    \\nExample:\\n
                    false`,
    },
    {
      name: 'fhd_bitrate_cutoff',
      type: 'number',
      defaultValue: 2500,
      inputUI: {
        type: 'text',
      },
      tooltip: `Specify the bitrate cutoff for FHD content.
                    \\nExample:\\n
                    2500
                    
                    \\nExample:\\n
                    3500`,
    },
    {
      name: 'handle_uhd',
      type: 'boolean',
      defaultValue: false,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Specify if UHD content should be handled.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    },
    {
      name: 'uhd_bitrate_cutoff',
      type: 'number',
      defaultValue: 6000,
      inputUI: {
        type: 'text',
      },
      tooltip: `Specify the bitrate cutoff for UHD content.
                    \\nExample:\\n
                    6000
                    
                    \\nExample:\\n
                    8000`,
    },
    {
      name: 'force_conform',
      type: 'boolean',
      defaultValue: false,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Make the file conform to output containers requirements.
                \\n Drop hdmv_pgs_subtitle/eia_608/subrip/timed_id3 for MP4.
                \\n Drop data streams/mov_text/eia_608/timed_id3 for MKV.
                \\n Default is false.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (file, librarySettings, inputs, otherArguments) => {
  const lib = require('../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  inputs = lib.loadDefaultValues(inputs, details);
  const response = {
    processFile: false,
    preset: '',
    handBrakeMode: false,
    FFmpegMode: true,
    reQueueAfter: true,
    infoLog: '',
  };

  const resolutions = {
    r480p: '480p',
    r576p: '576p',
    r720p: '720p',
    r1080p: '1080p',
    r4KUHD: '4k',
    rDCI4K: '4k',
    rOther: 'Other',
  };

  // Check if inputs.container has been configured. If it hasn't then exit plugin.
  if (inputs.container === '') {
    response.infoLog += 'Plugin has not been configured, please configure required options. Skipping this plugin. \n';
    response.processFile = false;
    return response;
  }

  if (inputs.container === 'original') {
    // eslint-disable-next-line no-param-reassign
    inputs.container = `${file.container}`;
  }
  response.container = `.${inputs.container}`;

  // Check if file is a video and has a codec and resolution.
  if (file.fileMedium !== 'video') {
    response.processFile = false;
    response.infoLog += 'File is not a video. \n';
    return response;
  }

  if (!file.ffProbeData.streams[0].codec_name) {
    response.processFile = false;
    response.infoLog += 'Cannot read codec name. \n';
    return response;
  }

  if (!file.video_resolution) {
    response.processFile = false;
    response.infoLog += 'Cannot read video resolution. \n';
    return response;
  }

  // Retrieve current video bitrate and resolution.
  let currentBitrate = file.ffProbeData.streams[0].bit_rate;
  if (Number.isNaN(currentBitrate)) {
    currentBitrate = file.bit_rate;
  }
  const videoResolution = file.video_resolution;
  const codecName = file.ffProbeData.streams[0].codec_name.toLowerCase();

  // Set up required variables.
  let extraArguments = '';
  let bitrateSettings = '';
  // Target bitrate is calculated based on current bitrate and resolution.
  const targetBitrate = 0;
  // Allow some leeway under and over the targetBitrate.
  const minimumBitrate = 0;
  const maximumBitrate = 0;
  const preset = 'medium';

  if ([resolutions.r480p, resolutions.r576p, resolutions.rOther].includes(videoResolution)) {
    // We have a SD video, abort.
    response.infoLog += 'SD video detected. \n';
    response.processFile = false;
    return response;
  }

  if (videoResolution === resolutions.r720p) {
    // We have a HD video.
    response.infoLog += 'HD video detected. \n';
    if (inputs.handle_hd === false) {
      response.infoLog += 'HD handling disabled. \n';
      response.processFile = false;
      return response;
    }
    if (inputs.hd_bitrate_cutoff !== '' && currentBitrate <= inputs.hd_bitrate_cutoff) {
      response.infoLog += `Bitrate is below ${inputs.hd_bitrate_cutoff} (${currentBitrate}). \n`;
      response.processFile = false;
      return response;
    }
    // todo: is anime ?
    // todo: set videoBitrate with a multiplier on current bitrate
    // todo: set videoMinBitrate with a multiplier based on videoBitrate
    // todo: set videoMaxBitrate with a multiplier based on videoBitrate
    // todo: set preset
  } else if (videoResolution === resolutions.r1080p) {
    // We have a FHD video.
    response.infoLog += 'FHD video detected. \n';
    if (inputs.handle_fhd === false) {
      response.infoLog += 'FHD handling disabled. \n';
      response.processFile = false;
      return response;
    }
    if (inputs.fhd_bitrate_cutoff !== '' && currentBitrate <= inputs.fhd_bitrate_cutoff) {
      response.infoLog += `Bitrate is below ${inputs.fhd_bitrate_cutoff} (${currentBitrate}). \n`;
      response.processFile = false;
      return response;
    }
    // todo: is anime ?
    // todo: set videoBitrate with a multiplier on current bitrate
    // todo: set videoMinBitrate with a multiplier based on videoBitrate
    // todo: set videoMaxBitrate with a multiplier based on videoBitrate
    // todo: set preset
  } else if (videoResolution === resolutions.r4KUHD || videoResolution === resolutions.rDCI4K) {
    // We have a UHD video.
    response.infoLog += 'UHD video detected. \n';
    if (inputs.handle_uhd === false) {
      response.infoLog += 'UHD handling disabled. \n';
      response.processFile = false;
      return response;
    }
    if (currentBitrate <= inputs.uhd_bitrate_cutoff) {
      response.infoLog += `Bitrate is below ${inputs.uhd_bitrate_cutoff} (${currentBitrate}). \n`;
      response.processFile = false;
      return response;
    }
    // todo: is anime ?
    // todo: set videoBitrate with a multiplier on current bitrate
    // todo: set videoMinBitrate with a multiplier based on videoBitrate
    // todo: set videoMaxBitrate with a multiplier based on videoBitrate
    // todo: set preset
  } else {
    // We have a video with an unknown resolution.
    response.infoLog += 'Unknown video resolution detected. \n';
    response.processFile = false;
    return response;
  }

  // If targetBitrate comes out as 0 then something has gone wrong and bitrates could not be calculcated.
  // Cancel plugin completely.
  if (targetBitrate === 0) {
    response.processFile = false;
    response.infoLog += 'Target bitrate could not be calculated. Skipping this plugin. \n';
    return response;
  }

  // Check if force_conform option is checked.
  // If so then check streams and add any extra parameters required to make file conform with output format.
  if (inputs.force_conform === true) {
    if (inputs.container.toLowerCase() === 'mkv') {
      extraArguments += '-map -0:d ';
      for (let i = 0; i < file.ffProbeData.streams.length; i++) {
        try {
          if (
            file.ffProbeData.streams[i].codec_name
              .toLowerCase() === 'mov_text'
            || file.ffProbeData.streams[i].codec_name
              .toLowerCase() === 'eia_608'
            || file.ffProbeData.streams[i].codec_name
              .toLowerCase() === 'timed_id3'
          ) {
            extraArguments += `-map -0:${i} `;
          }
        } catch (err) {
          // Error
        }
      }
    }
    if (inputs.container.toLowerCase() === 'mp4') {
      for (let i = 0; i < file.ffProbeData.streams.length; i++) {
        try {
          if (
            file.ffProbeData.streams[i].codec_name
              .toLowerCase() === 'hdmv_pgs_subtitle'
            || file.ffProbeData.streams[i].codec_name
              .toLowerCase() === 'eia_608'
            || file.ffProbeData.streams[i].codec_name
              .toLowerCase() === 'subrip'
            || file.ffProbeData.streams[i].codec_name
              .toLowerCase() === 'timed_id3'
          ) {
            extraArguments += `-map -0:${i} `;
          }
        } catch (err) {
          // Error
        }
      }
    }
  }

  // Check if codec of stream is hevc or vp9
  // AND file.container matches inputs.container.
  // If so then skip file.
  if ((codecName === 'hevc' || codecName === 'vp9') && file.container === `${inputs.container}`) {
    response.processFile = false;
    response.infoLog += `File is already hevc or vp9 & in ${inputs.container}. \n`;
    return response;
  }
  // Check if codec of stream is hevc or vp9
  // AND check if file.container does NOT match inputs.container.
  // If so remux file.
  if ((codecName === 'hevc' || codecName === 'vp9') && file.container !== `${inputs.container}`) {
    response.infoLog += `File is hevc or vp9 but is not in ${inputs.container} container. Remuxing. \n`;
    response.preset = `, -map 0 -c copy ${extraArguments}`;
    response.processFile = true;
    return response;
  }

  // Set bitrateSettings variable using bitrate information calulcated earlier.
  bitrateSettings = `-b:v ${targetBitrate}k -minrate ${minimumBitrate}k `
    + `-maxrate ${maximumBitrate}k -bufsize ${currentBitrate}k`;
  // Print to infoLog information around file & bitrate settings.
  response.infoLog += `Container for output selected as ${inputs.container}. \n`;
  response.infoLog += `Current bitrate = ${currentBitrate} \n`;
  response.infoLog += 'Bitrate settings: \n';
  response.infoLog += `Target = ${targetBitrate} \n`;
  response.infoLog += `Minimum = ${minimumBitrate} \n`;
  response.infoLog += `Maximum = ${maximumBitrate} \n`;
  response.infoLog += `Buffer = ${currentBitrate} \n`;
  response.infoLog += `Preset = ${preset} \n`;

  response.preset += `,-map 0 -c:v libx265 ${bitrateSettings} `
    + `-c:a copy -c:s copy -max_muxing_queue_size 9999 ${extraArguments} -preset ${preset} `;
  response.processFile = true;
  response.infoLog += 'File is not hevc or vp9. Transcoding. \n';
  return response;
};

// Bitrate settings maps
const bitrateSettingsMap = {
  general: {
    '720p': [{
      cutoff: 1200, multiplier: 0.6, minPercentage: 70, maxPercentage: 130, preset: 'slow',
    },
    {
      cutoff: 1800, multiplier: 0.55, minPercentage: 70, maxPercentage: 130, preset: 'medium',
    },
    {
      cutoff: 2400, multiplier: 0.5, minPercentage: 70, maxPercentage: 130, preset: 'medium',
    }],
    // Add entries for 1080p, 4K, etc.
  },
  anime: {
    '720p': [{
      cutoff: 1000, multiplier: 0.6, minPercentage: 70, maxPercentage: 130, preset: 'slow',
    },
    {
      cutoff: 1500, multiplier: 0.55, minPercentage: 70, maxPercentage: 130, preset: 'medium',
    },
    {
      cutoff: 2000, multiplier: 0.5, minPercentage: 70, maxPercentage: 130, preset: 'medium',
    }],
    // Add entries for 1080p, 4K, etc.
  },
};

const calculateBitrateSettings = (resolution, currentBitrate, isAnime) => {
  const settingsMap = isAnime ? bitrateSettingsMap.anime : bitrateSettingsMap.general;
  const settings = settingsMap[resolution].find((setting) => currentBitrate > setting.cutoff);

  if (!settings) return null; // Return null if no settings match

  const targetBitrate = currentBitrate * settings.multiplier;
  const minimumBitrate = targetBitrate * (settings.minPercentage / 100);
  const maximumBitrate = targetBitrate * (settings.maxPercentage / 100);
  const { preset } = settings;

  return {
    targetBitrate, minimumBitrate, maximumBitrate, preset,
  };
};

module.exports.details = details;
module.exports.plugin = plugin;
